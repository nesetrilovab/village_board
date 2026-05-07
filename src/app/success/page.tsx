export default function SuccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <h1 className="text-3xl font-bold text-green-600">Platba proběhla úspěšně!</h1>
      <p className="text-slate-600 mt-2">Váš inzerát byl právě zveřejněn.</p>
      <a href="/feed" className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl">
        Zpět na hlavní zeď
      </a>
    </div>
  );
}