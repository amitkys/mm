export function Footer() {
  return (
    <div className="z-20 w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-4 md:mx-8 flex h-14 items-center">
        <p className="text-xs md:text-sm leading-loose text-muted-foreground text-left">
          &copy; {new Date().getFullYear()} mm. All rights reserved.
        </p>
      </div>
    </div>
  );
}
