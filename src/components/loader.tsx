import { Loader2 } from "lucide-react";

const Loader = () => {
  return (
    <section className="h-screen w-screen flex justify-center items-center bg-gray-100 gap-2">
      <Loader2 className="animate-spin my-auto" size={20} />
      <p className="my-auto text-sm font-bold">Please wait...</p>
    </section>
  )
}
export default Loader;