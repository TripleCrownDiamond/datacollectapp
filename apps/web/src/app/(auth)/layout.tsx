export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 to-background px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary">TerraCollect</h1>
          <p className="mt-1 text-sm text-muted">Collecte de données terrain intelligente</p>
        </div>
        {children}
      </div>
    </div>
  );
}
