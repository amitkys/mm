import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] w-full flex-1 items-center justify-center p-8">
      <Spinner size="2xl" />
    </div>
  );
}
