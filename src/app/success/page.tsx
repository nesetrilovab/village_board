export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center border-t-8 border-t-green-500">
        <h1 className="text-3xl font-extrabold text-slate-800 mb-4">Payment accepted</h1>
        <p className="text-slate-600 mb-8">
          Your advertisement has been successfully published and will appear on the board shortly.
        </p>
        <div className="space-y-3">
          <a href="/feed" className="block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md">
            Go to board
          </a>
        </div>
      </div>
    </div>
  );
}