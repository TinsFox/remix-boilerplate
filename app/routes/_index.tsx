import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { RemixLogo } from "~/components/icons/remix";

export const meta: MetaFunction = () => {
  return [
    { title: "Remix Boilerplate" },
    { name: "description", content: "Remix Boilerplate" },
  ];
};

export default function Index() {
  return (
    <main className="font-poppins grid h-full place-items-center">
      <div className="grid place-items-center px-4 py-16 ">
        <div className="flex max-w-md flex-col items-center text-center">
          <a
            href="https://github.com/TinsFox/remix-boilerplate"
            className="animate-slide-top [animation-fill-mode:backwards] xl:animate-slide-left xl:[animation-delay:0.5s] xl:[animation-fill-mode:backwards]"
          >
            <RemixLogo />
          </a>
          <h1
            data-heading
            className="text-nowrap mt-8 animate-slide-top text-4xl font-medium text-foreground [animation-delay:0.3s] [animation-fill-mode:backwards] md:text-5xl xl:mt-4 xl:animate-slide-left xl:text-6xl xl:[animation-delay:0.8s] xl:[animation-fill-mode:backwards]"
          >
            <a href="https://github.com/TinsFox/remix-boilerplate">
              Remix Boilerplate
            </a>
          </h1>
          <button className="mt-8">
            <Link to={"login"}>Login</Link>
          </button>
        </div>
      </div>
    </main>
  );
}
