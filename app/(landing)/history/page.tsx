import { Metadata } from "next";
import PageHeader from "@/components/page-header";
import { dummyProfileImage } from "@/lib/constants";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";
import React from "react";
import { generatePageMetadata } from "@/lib/constants/metadata";

export const metadata: Metadata = generatePageMetadata("history");

const HistoryPage = () => {
  return (
    <div className="pb-20">
      {/* HEADER SECTION */}
      <div className="px-4 md:px-10 xl:px-16">
        <PageHeader title="Family History" />
      </div>

      {/* HERO SECTION */}
      <div className="relative h-[585px] w-full">
        <Image
          src="/images/landing/hero_section.webp"
          alt="History"
          fill
          className="object-cover object-bottom"
          priority
        />
        <div className="absolute inset-0 bg-foreground/50" />

        {/* Centered Heading */}
        <div className="absolute inset-0 flex items-center justify-center">
          <h2 className="text-4xl md:text-6xl font-bold text-center text-background px-4">
            Our Family History
          </h2>
        </div>
      </div>

      {/* COLLAPSIBLE CONTENT SECTIONS */}
      <div className="px-4 md:px-10 xl:px-16 mt-8 lg:mt-12">
        <Accordion type="multiple" className="w-full space-y-4">
          {/* PREFACE SECTION */}
          <AccordionItem value="preface" className="border rounded-lg px-4">
            <AccordionTrigger className="text-2xl md:text-3xl font-bold hover:no-underline">
              INTRODUCTION
            </AccordionTrigger>
            <AccordionContent className="text-justify space-y-4 pt-4">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
                in reprehenderit in voluptate velit esse cillum dolore eu fugiat
                nulla pariatur.
                <p>
                  Excepteur sint occaecat cupidatat non proident, sunt in culpa
                  qui officia deserunt mollit anim id est laborum. Sed ut
                  perspiciatis unde omnis iste natus error sit voluptatem
                  accusantium doloremque laudantium, totam rem aperiam, eaque
                  ipsa quae ab illo inventore veritatis et quasi architecto
                  beatae vitae dicta sunt explicabo.
                </p>
              </p>
              <p>
                Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit
                aut fugit, sed quia consequuntur magni dolores eos qui ratione
                voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem
                ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia
                non numquam eius modi tempora incidunt ut labore et dolore
                magnam aliquam quaerat voluptatem.
                <p className="flex flex-col mt-4">
                  <i>Lorem Ipsum</i>
                  <i>Dolor Sit Amet</i>
                  <i>January 1, 2024.</i>
                </p>
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* PATRON&apos;S MESSAGE SECTION */}
          <AccordionItem
            value="patron-message"
            className="border rounded-lg px-4"
          >
            <AccordionTrigger className="text-2xl md:text-3xl font-bold hover:no-underline">
              PATRON MESSAGE
            </AccordionTrigger>
            <AccordionContent className="text-justify space-y-4 pt-4">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
                in reprehenderit in voluptate velit esse cillum dolore eu fugiat
                nulla pariatur. Excepteur sint occaecat cupidatat non proident,
                sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>
              <p>
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem
                accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
                quae ab illo inventore veritatis et quasi architecto beatae
                vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia
                voluptas sit aspernatur aut odit aut fugit.
                <div className="flex flex-col mt-4 font-semibold">
                  <p>
                    DR. L. LOREM (Patron) <br />
                    IPSUM DOLOR SIT AMET
                  </p>

                  <br />

                  <p>
                    Dr. L. A. LOREM <br />
                    Patron – Lorem Descendants
                  </p>
                </div>
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* PRESIDENT&apos;S MESSAGE SECTION */}
          <AccordionItem
            value="president-message"
            className="border rounded-lg px-4"
          >
            <AccordionTrigger className="text-2xl md:text-3xl font-bold hover:no-underline">
              PRESIDENT MESSAGE
            </AccordionTrigger>
            <AccordionContent className="text-justify space-y-4 pt-4">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
                in reprehenderit in voluptate velit esse cillum dolore eu fugiat
                nulla pariatur. Excepteur sint occaecat cupidatat non proident,
                sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>
              <p>
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem
                accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
                quae ab illo inventore veritatis et quasi architecto beatae
                vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia
                voluptas sit aspernatur aut odit aut fugit.
                <p className="flex flex-col mt-4">
                  <i>Mrs. A. B. Lorem</i>
                  <i>President - Lorem Descendants</i>
                </p>
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* THE STORY SECTION */}
          <AccordionItem value="the-story" className="border rounded-lg px-4">
            <AccordionTrigger className="text-2xl md:text-3xl font-bold hover:no-underline">
              FAMILY STORY
            </AccordionTrigger>
            <AccordionContent className="text-justify space-y-6 pt-4">
              <div className="space-y-4">
                <h3 className="text-xl md:text-2xl font-bold">
                  Meaning of Lorem
                </h3>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                  irure dolor in reprehenderit in voluptate velit esse cillum
                  dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                  cupidatat non proident, sunt in culpa qui officia deserunt
                  mollit anim id est laborum.
                </p>

                <p>
                  Sed ut perspiciatis unde omnis iste natus error sit voluptatem
                  accusantium doloremque laudantium, totam rem aperiam, eaque
                  ipsa quae ab illo inventore veritatis et quasi architecto
                  beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem
                  quia voluptas sit aspernatur aut odit aut fugit, sed quia
                  consequuntur magni dolores eos qui ratione voluptatem sequi
                  nesciunt.
                </p>

                <p>
                  Neque porro quisquam est, qui dolorem ipsum quia dolor sit
                  amet, consectetur, adipisci velit, sed quia non numquam eius
                  modi tempora incidunt ut labore et dolore magnam aliquam
                  quaerat voluptatem. Ut enim ad minima veniam, quis nostrum
                  exercitationem ullam corporis suscipit laboriosam, nisi ut
                  aliquid ex ea commodi consequatur.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl md:text-2xl font-bold">
                  Lorem Ipsum — The 1st Lorem
                </h3>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                  irure dolor in reprehenderit in voluptate velit esse cillum
                  dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                  cupidatat non proident, sunt in culpa qui officia deserunt
                  mollit anim id est laborum.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl md:text-2xl font-bold">
                  Dolor Sit Amet
                </h3>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                  irure dolor in reprehenderit in voluptate velit esse cillum
                  dolore eu fugiat nulla pariatur.
                </p>

                <p>
                  Excepteur sint occaecat cupidatat non proident, sunt in culpa
                  qui officia deserunt mollit anim id est laborum. Sed ut
                  perspiciatis unde omnis iste natus error sit voluptatem
                  accusantium doloremque laudantium, totam rem aperiam, eaque
                  ipsa quae ab illo inventore veritatis et quasi architecto
                  beatae vitae dicta sunt explicabo.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl md:text-2xl font-bold">
                  Consectetur Adipiscing
                </h3>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                  irure dolor in reprehenderit in voluptate velit esse cillum
                  dolore eu fugiat nulla pariatur.
                </p>

                <p>
                  Excepteur sint occaecat cupidatat non proident, sunt in culpa
                  qui officia deserunt mollit anim id est laborum. Sed ut
                  perspiciatis unde omnis iste natus error sit voluptatem
                  accusantium doloremque laudantium, totam rem aperiam, eaque
                  ipsa quae ab illo inventore veritatis et quasi architecto
                  beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem
                  quia voluptas sit aspernatur aut odit aut fugit.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl md:text-2xl font-bold">
                  Sed Do Eiusmod
                </h3>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat.
                </p>

                <p>
                  Duis aute irure dolor in reprehenderit in voluptate velit esse
                  cillum dolore eu fugiat nulla pariatur. Excepteur sint
                  occaecat cupidatat non proident, sunt in culpa qui officia
                  deserunt mollit anim id est laborum.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl md:text-2xl font-bold">
                  Tempor Incididunt
                </h3>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat.
                </p>
                <p>
                  Duis aute irure dolor in reprehenderit in voluptate velit esse
                  cillum dolore eu fugiat nulla pariatur. Excepteur sint
                  occaecat cupidatat non proident, sunt in culpa qui officia
                  deserunt mollit anim id est laborum.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl md:text-2xl font-bold">
                  Labore Et Dolore
                </h3>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                  irure dolor in reprehenderit in voluptate velit esse cillum
                  dolore eu fugiat nulla pariatur.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl md:text-2xl font-bold">Magna Aliqua</h3>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                  irure dolor in reprehenderit in voluptate velit esse cillum
                  dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                  cupidatat non proident, sunt in culpa qui officia deserunt
                  mollit anim id est laborum.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl md:text-2xl font-bold">
                  Ut Enim Ad Minim
                </h3>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                  irure dolor in reprehenderit in voluptate velit esse cillum
                  dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                  cupidatat non proident, sunt in culpa qui officia deserunt
                  mollit anim id est laborum.
                </p>

                <p>
                  <strong>
                    Sed ut perspiciatis unde omnis iste natus error sit
                    voluptatem accusantium doloremque laudantium, totam rem
                    aperiam, eaque ipsa quae ab illo inventore veritatis et
                    quasi architecto beatae vitae dicta sunt explicabo.
                  </strong>{" "}
                  Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut
                  odit aut fugit, sed quia consequuntur magni dolores eos qui
                  ratione voluptatem sequi nesciunt.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ORÍKÌ ILÉ MOSURO SECTION */}
          <AccordionItem value="oriki" className="border rounded-lg px-4">
            <AccordionTrigger className="text-2xl md:text-3xl font-bold hover:no-underline">
              FAMILY PRAISES
            </AccordionTrigger>
            <AccordionContent className="text-justify space-y-4 pt-4">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. <br />
                Sed do eiusmod tempor incididunt ut labore et dolore magna
                aliqua. <br />
                Ut enim ad minim veniam, quis nostrud exercitation ullamco
                laboris. <br />
                Nisi ut aliquip ex ea commodo consequat. <br />
                Duis aute irure dolor in reprehenderit in voluptate velit esse.{" "}
                <br />
                Cillum dolore eu fugiat nulla pariatur. <br />
                Excepteur sint occaecat cupidatat non proident. <br />
                Sunt in culpa qui officia deserunt mollit anim id est laborum.{" "}
                <br />
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem.{" "}
                <br />
                Accusantium doloremque laudantium, totam rem aperiam. <br />
                Eaque ipsa quae ab illo inventore veritatis et quasi architecto.{" "}
                <br />
                Beatae vitae dicta sunt explicabo. <br />
                Nemo enim ipsam voluptatem quia voluptas sit aspernatur. <br />
                Aut odit aut fugit, sed quia consequuntur magni dolores eos.{" "}
                <br />
                Qui ratione voluptatem sequi nesciunt. <br />
                Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.{" "}
                <br />
                Consectetur, adipisci velit, sed quia non numquam eius modi.{" "}
                <br />
                Tempora incidunt ut labore et dolore magnam aliquam quaerat
                voluptatem. <br />
                Ut enim ad minima veniam, quis nostrum exercitationem ullam
                corporis. <br />
                Suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.{" "}
                <br />
                Quis autem vel eum iure reprehenderit qui in ea voluptate.{" "}
                <br />
                Velit esse quam nihil molestiae consequatur, vel illum qui
                dolorem. <br />
                Eum fugiat quo voluptas nulla pariatur. <br />
                At vero eos et accusamus et iusto odio dignissimos ducimus.{" "}
                <br />
                Qui blanditiis praesentium voluptatum deleniti atque corrupti.{" "}
                <br />
                Quos dolores et quas molestias excepturi sint occaecati
                cupiditate. <br />
                Non provident, similique sunt in culpa qui officia deserunt.{" "}
                <br />
                Mollitia animi, id est laborum et dolorum fuga. <br />
                Et harum quidem rerum facilis est et expedita distinctio. <br />
                Nam libero tempore, cum soluta nobis est eligendi optio. <br />
                Cumque nihil impedit quo minus id quod maxime placeat facere.{" "}
                <br />
                Possimus, omnis voluptas assumenda est, omnis dolor repellendus.{" "}
                <br />
                Temporibus autem quibusdam et aut officiis debitis aut rerum.{" "}
                <br />
                Necessitatibus saepe eveniet ut et voluptates repudiandae sint.{" "}
                <br />
                Et molestiae non recusandae. <br />
                Itaque earum rerum hic tenetur a sapiente delectus. <br />
                Ut aut reiciendis voluptatibus maiores alias consequatur aut.{" "}
                <br />
                Perferendis doloribus asperiores repellat. <br />
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* PEDIGREE SECTION */}
          <AccordionItem value="pedigree" className="border rounded-lg px-4">
            <AccordionTrigger className="text-2xl md:text-3xl font-bold hover:no-underline">
              FAMILY TREE
            </AccordionTrigger>
            <AccordionContent className="text-justify space-y-4 pt-4">
              <p>
                <strong>Introduction</strong> Lorem ipsum dolor sit amet,
                consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
                labore et dolore magna aliqua. Ut enim ad minim veniam, quis
                nostrud exercitation ullamco laboris nisi ut aliquip ex ea
                commodo consequat.
              </p>
              <p>
                Duis aute irure dolor in reprehenderit in voluptate velit esse
                cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                cupidatat non proident, sunt in culpa qui officia deserunt
                mollit anim id est laborum. Sed ut perspiciatis unde omnis iste
                natus error sit voluptatem accusantium doloremque laudantium.
              </p>

              <p>
                Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis
                et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim
                ipsam voluptatem quia voluptas sit aspernatur aut odit aut
                fugit, sed quia consequuntur magni dolores eos qui ratione
                voluptatem sequi nesciunt.
              </p>

              <p>
                Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet,
                consectetur, adipisci velit, sed quia non numquam eius modi
                tempora incidunt ut labore et dolore magnam aliquam quaerat
                voluptatem. Ut enim ad minima veniam, quis nostrum
                exercitationem ullam corporis suscipit laboriosam.
              </p>

              <p>
                <strong>Editor&apos;s Note:</strong> Nisi ut aliquid ex ea
                commodi consequatur. Quis autem vel eum iure reprehenderit qui
                in ea voluptate velit esse quam nihil molestiae consequatur, vel
                illum qui dolorem eum fugiat quo voluptas nulla pariatur.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default HistoryPage;
