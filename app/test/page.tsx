import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <div className="flex flex-col gap-8 p-8 max-w-xl">
      {/* 1. Inside Buttons (Standard / Small) */}
      <div className="flex items-center gap-4">
        <Button disabled>
          <Spinner size="sm" />
          Loading...
        </Button>
        <Button size="lg" disabled>
          <Spinner size="md" />
          Processing
        </Button>
      </div>

      {/* 2. Standard Size Rules */}
      <div className="flex items-center gap-6">
        <Spinner size="xs" /> {/* 12px - Badges / Micro elements */}
        <Spinner size="sm" /> {/* 16px - Buttons / Inputs */}
        <Spinner size="md" /> {/* 24px - Section / Cards */}
        <Spinner size="lg" /> {/* 32px - Modals / Dialogs */}
        <Spinner size="xl" /> {/* 48px - Page / Home Screen Loader */}
        <Spinner size="2xl" /> {/* 64px - Hero / Screen Overlay */}
      </div>
    </div>
  );
}