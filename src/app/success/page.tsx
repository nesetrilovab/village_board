export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center border-t-8 border-t-green-500">
        <h1 className="text-3xl font-extrabold text-slate-800 mb-4">Platba přijata</h1>
        <p className="text-slate-600 mb-8">
          Váš inzerát byl úspěšně zaplacen a během několika sekund se objeví na hlavní zdi.
        </p>
        <div className="space-y-3">
          <a href="/feed" className="block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md">
            Přejít na Feed
          </a>
        </div>
      </div>
    </div>
  );
}