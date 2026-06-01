export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-orange-600">BuildConnect</h1>
          <p className="text-gray-500 mt-1">Rwanda's Construction Platform</p>
        </div>
        {children}
      </div>
    </div>
  );
}