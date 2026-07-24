import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Prisma } from '@prisma/client';
import { FormSchemaSchema } from '@terracollect/shared';
import { parseExpression, type AstNode } from '@terracollect/form-engine';

/** A single schema problem, returned in the 422 `details` array. */
export interface SchemaIssue {
  path: string;
  rule: string;
  message: string;
}

/** Question types that require a non-empty `options` list. */
const CHOICE_TYPES = new Set(['select_one', 'select_multiple']);

@Injectable()
export class FormsService {
  constructor(private prisma: PrismaService) {}

  // ────────────────────────────── Read ──────────────────────────────

  async listForms(orgId: string, projectId: string) {
    await this.assertProject(orgId, projectId);

    const forms = await this.prisma.form.findMany({
      where: { organizationId: orgId, projectId, deletedAt: null },
      include: { _count: { select: { formVersions: true } } },
      orderBy: { updatedAt: 'desc' },
    });

    return forms.map((f) => ({
      id: f.id,
      projectId: f.projectId,
      name: f.name,
      status: f.status,
      currentVersion: f.currentVersion,
      versionCount: f._count.formVersions,
      createdAt: f.createdAt,
      updatedAt: f.updatedAt,
    }));
  }

  async getForm(orgId: string, formId: string) {
    const form = await this.findFormOrThrow(orgId, formId);

    return {
      id: form.id,
      projectId: form.projectId,
      name: form.name,
      status: form.status,
      currentVersion: form.currentVersion,
      draftSchema: form.draftSchema,
      createdAt: form.createdAt,
      updatedAt: form.updatedAt,
    };
  }

  async listVersions(orgId: string, formId: string) {
    await this.findFormOrThrow(orgId, formId);

    const versions = await this.prisma.formVersion.findMany({
      where: { organizationId: orgId, formId },
      select: { version: true, publishedAt: true, publishedById: true },
      orderBy: { version: 'desc' },
    });

    return versions;
  }

  async getVersion(orgId: string, formId: string, version: number) {
    await this.findFormOrThrow(orgId, formId);

    const formVersion = await this.prisma.formVersion.findFirst({
      where: { organizationId: orgId, formId, version },
    });

    if (!formVersion) {
      throw new NotFoundException(`Version ${version} not found for this form`);
    }

    return {
      version: formVersion.version,
      schema: formVersion.schema,
      publishedAt: formVersion.publishedAt,
      publishedById: formVersion.publishedById,
    };
  }

  // ────────────────────────────── Write ─────────────────────────────

  async createForm(
    orgId: string,
    projectId: string,
    userId: string,
    data: { name: string; draftSchema?: unknown },
  ) {
    await this.assertProject(orgId, projectId);

    return this.prisma.form.create({
      data: {
        organizationId: orgId,
        projectId,
        name: data.name,
        createdById: userId,
        draftSchema: (data.draftSchema ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  }

  /** Autosave from the form builder. Never touches published versions. */
  async updateForm(
    orgId: string,
    formId: string,
    data: { name?: string; status?: string; draftSchema?: unknown },
  ) {
    await this.findFormOrThrow(orgId, formId);

    if (data.status && !['draft', 'published', 'archived'].includes(data.status)) {
      throw new UnprocessableEntityException({
        message: 'Invalid form status',
        details: [
          { path: 'status', rule: 'enum', message: 'Expected draft, published or archived' },
        ],
      });
    }

    return this.prisma.form.update({
      where: { id: formId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.draftSchema !== undefined && {
          draftSchema: data.draftSchema as Prisma.InputJsonValue,
        }),
      },
    });
  }

  /**
   * Publishes the current draft as an IMMUTABLE version n+1.
   * Validates the schema first — a published version must always be executable.
   */
  async publishForm(orgId: string, formId: string, userId: string) {
    const form = await this.findFormOrThrow(orgId, formId);

    if (!form.draftSchema) {
      throw new UnprocessableEntityException({
        message: 'Cannot publish a form without a draft schema',
        details: [{ path: 'draftSchema', rule: 'required', message: 'No draft to publish' }],
      });
    }

    const schema = this.validateSchema(form.draftSchema);
    const nextVersion = form.currentVersion + 1;

    try {
      const [version] = await this.prisma.$transaction([
        this.prisma.formVersion.create({
          data: {
            organizationId: orgId,
            formId,
            version: nextVersion,
            schema: schema as Prisma.InputJsonValue,
            publishedById: userId,
          },
        }),
        this.prisma.form.update({
          where: { id: formId },
          data: { currentVersion: nextVersion, status: 'published' },
        }),
      ]);

      return {
        formId,
        version: version.version,
        publishedAt: version.publishedAt,
      };
    } catch (err) {
      // Unique (formId, version) violated → a concurrent publish won the race.
      if ((err as { code?: string }).code === 'P2002') {
        throw new ConflictException('A concurrent publish already created this version');
      }
      throw err;
    }
  }

  async duplicateForm(orgId: string, formId: string, userId: string) {
    const form = await this.findFormOrThrow(orgId, formId);

    // Prefer the draft; fall back to the latest published version.
    let schema = form.draftSchema;
    if (!schema && form.currentVersion > 0) {
      const latest = await this.prisma.formVersion.findFirst({
        where: { organizationId: orgId, formId, version: form.currentVersion },
      });
      schema = latest?.schema ?? null;
    }

    return this.prisma.form.create({
      data: {
        organizationId: orgId,
        projectId: form.projectId,
        name: `${form.name} (copie)`,
        createdById: userId,
        status: 'draft',
        currentVersion: 0,
        draftSchema: (schema ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  }

  // ─────────────────────────── Validation ───────────────────────────

  /**
   * Validates a form schema before publication.
   * Structural checks via zod, then semantic rules the engine relies on.
   * Throws 422 with a `details` array listing every problem at once.
   */
  validateSchema(raw: unknown) {
    const parsed = FormSchemaSchema.safeParse(raw);

    if (!parsed.success) {
      throw new UnprocessableEntityException({
        message: 'Form schema is invalid',
        details: parsed.error.issues.map((i) => ({
          path: i.path.join('.'),
          rule: i.code,
          message: i.message,
        })),
      });
    }

    const schema = parsed.data;
    const issues: SchemaIssue[] = [...this.checkSemantics(schema)];

    if (issues.length > 0) {
      throw new UnprocessableEntityException({
        message: 'Form schema is invalid',
        details: issues,
      });
    }

    return schema;
  }

  /**
   * Semantic rules that zod cannot express:
   * unique names, choice options, language coherence, and expression
   * correctness (parseable, no forward or unknown references).
   */
  private checkSemantics(schema: {
    defaultLanguage: string;
    languages: string[];
    pages: Array<{
      name: string;
      repeat: boolean;
      questions: Array<{
        name: string;
        type: string;
        options?: Array<{ value: string }>;
        relevant?: string;
        constraint?: string;
        calculation?: string;
      }>;
    }>;
  }): SchemaIssue[] {
    const issues: SchemaIssue[] = [];

    if (!schema.languages.includes(schema.defaultLanguage)) {
      issues.push({
        path: 'defaultLanguage',
        rule: 'language_coherence',
        message: `Default language "${schema.defaultLanguage}" is not in the languages list`,
      });
    }

    const seenPages = new Set<string>();
    const seenQuestions = new Set<string>();
    let questionCount = 0;

    schema.pages.forEach((page, pageIdx) => {
      if (seenPages.has(page.name)) {
        issues.push({
          path: `pages.${pageIdx}.name`,
          rule: 'unique_name',
          message: `Duplicate page name "${page.name}"`,
        });
      }
      seenPages.add(page.name);

      page.questions.forEach((q, qIdx) => {
        const path = `pages.${pageIdx}.questions.${qIdx}`;
        questionCount++;

        if (seenQuestions.has(q.name)) {
          issues.push({
            path: `${path}.name`,
            rule: 'unique_name',
            message: `Duplicate question name "${q.name}" — variable names must be unique across the form`,
          });
        }

        if (CHOICE_TYPES.has(q.type) && (!q.options || q.options.length === 0)) {
          issues.push({
            path: `${path}.options`,
            rule: 'options_required',
            message: `Question "${q.name}" of type ${q.type} must define at least one option`,
          });
        }

        if (q.type === 'calculate' && !q.calculation) {
          issues.push({
            path: `${path}.calculation`,
            rule: 'calculation_required',
            message: `Calculate question "${q.name}" must define a calculation`,
          });
        }

        // Expressions: must parse, and may only reference already-declared
        // questions (forbids forward references and self-reference cycles).
        for (const field of ['relevant', 'constraint', 'calculation'] as const) {
          const expr = q[field];
          if (!expr) continue;

          let ast: AstNode;
          try {
            ast = parseExpression(expr);
          } catch (err) {
            issues.push({
              path: `${path}.${field}`,
              rule: 'expression_syntax',
              message: `Invalid expression in "${q.name}": ${(err as Error).message}`,
            });
            continue;
          }

          const vars = new Set<string>();
          this.collectVariables(ast, vars);

          for (const v of vars) {
            // `constraint` legitimately refers to the current answer (`.`/self).
            if (v === q.name && field === 'constraint') continue;

            if (v === q.name) {
              issues.push({
                path: `${path}.${field}`,
                rule: 'circular_reference',
                message: `Question "${q.name}" references itself in ${field}`,
              });
            } else if (!seenQuestions.has(v)) {
              issues.push({
                path: `${path}.${field}`,
                rule: 'forward_reference',
                message: `"${q.name}" references "${v}", which is not defined before it`,
              });
            }
          }
        }

        seenQuestions.add(q.name);
      });
    });

    if (questionCount === 0) {
      issues.push({
        path: 'pages',
        rule: 'min_questions',
        message: 'A form must contain at least one question',
      });
    }

    return issues;
  }

  /** Walks an expression AST and collects every referenced variable name. */
  private collectVariables(node: AstNode, out: Set<string>): void {
    switch (node.kind) {
      case 'variable':
        out.add(node.name);
        break;
      case 'binary':
        this.collectVariables(node.left, out);
        this.collectVariables(node.right, out);
        break;
      case 'unary':
        this.collectVariables(node.operand, out);
        break;
      case 'group':
        this.collectVariables(node.inner, out);
        break;
      case 'function':
        node.args.forEach((arg) => this.collectVariables(arg, out));
        break;
      default:
        break; // literal — nothing to collect
    }
  }

  // ──────────────────────────── Helpers ─────────────────────────────

  private async findFormOrThrow(orgId: string, formId: string) {
    const form = await this.prisma.form.findFirst({
      where: { id: formId, organizationId: orgId, deletedAt: null },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    return form;
  }

  // ─────────────────────────── Assignments ──────────────────────────

  async getAssignments(orgId: string, formId: string) {
    await this.findFormOrThrow(orgId, formId);

    const assignments = await this.prisma.formAssignment.findMany({
      where: { organizationId: orgId, formId },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
      },
    });

    const allAssigned = assignments.some((a) => a.userId === null);

    return {
      all: allAssigned,
      users: assignments
        .filter((a) => a.userId !== null)
        .map((a) => ({
          id: a.user!.id,
          fullName: a.user!.fullName,
          email: a.user!.email,
          assignedAt: a.createdAt,
        })),
    };
  }

  async setAssignments(
    orgId: string,
    formId: string,
    data: { userIds?: string[]; all?: boolean },
  ) {
    await this.findFormOrThrow(orgId, formId);

    await this.prisma.formAssignment.deleteMany({
      where: { organizationId: orgId, formId },
    });

    if (data.all) {
      await this.prisma.formAssignment.create({
        data: {
          organizationId: orgId,
          formId,
          userId: null,
        },
      });
    } else if (data.userIds?.length) {
      await this.prisma.formAssignment.createMany({
        data: data.userIds.map((userId) => ({
          organizationId: orgId,
          formId,
          userId,
        })),
      });
    }

    return this.getAssignments(orgId, formId);
  }

  private async assertProject(orgId: string, projectId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, organizationId: orgId, deletedAt: null },
      select: { id: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }
}
