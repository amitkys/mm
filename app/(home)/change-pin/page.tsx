import { ChangePinForm } from "@/app/(home)/change-pin/_components/change-pin-form";
import { ContentLayout } from "@/components/admin-panel/content-layout";

export default function ChangePinPage() {
  return (
    <ContentLayout title="Security">
      <ChangePinForm />
    </ContentLayout>
  );
}
