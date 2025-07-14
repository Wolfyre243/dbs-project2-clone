export default function LoadingSpinner() {
  return (
    <div className="flex flex-col gap-5 justify-center items-center h-full w-full">
      <h1 className="text-xl">Loading...</h1>
      <div className="w-16 h-16 border-4 border-neutral-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
