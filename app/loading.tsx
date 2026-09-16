import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-8">
      <Spinner size="2xl" />
    </div>
  );
}
