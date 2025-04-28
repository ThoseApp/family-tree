import PageHeader from "@/components/page-header";
import { dummyProfileImage } from "@/lib/constants";
import Image from "next/image";
import React from "react";

const HistoryPage = () => {
  return (
    <div className="pb-20">
      {/* HEADER SECTION */}
      <div className="px-4 md:px-10 xl:px-16">
        <PageHeader title="History" searchBar />
      </div>

      {/* HERO SECTION */}
      <div className="relative h-[585px] w-full">
        <Image
          src="/images/landing/makes_history.webp"
          alt="History"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-foreground/50" />

        {/* Centered Heading */}
        <div className="absolute inset-0 flex items-center justify-center">
          <h2 className="text-4xl md:text-6xl font-bold text-center text-background px-4">
            Meaning of Mosuro
          </h2>
        </div>
      </div>
      <div className="flex flex-col gap-y-8 lg:gap-y-12 px-4 md:px-10 xl:px-16 mt-8 lg:mt-12">
        {/* FIRST BLOCK OF PARAGRAPHS */}
        <div className="flex flex-col gap-y-4 lg:gap-y-8 text-justify ">
          <p>
            In years past, before the advent of Christianity and Islam in
            Ijebu-Ode, various indigenous modes of religious worship or beliefs
            served the people spiritually. Most of these traditional beliefs and
            the roles they played in the society are vaguely understood today
            and have suffered pejorative labelling. Many are now referred to and
            looked down upon as “primitive”, “heathenism” or “paganism”. The
            traditional divinities worshipped and celebrated in Ijebu-Ode
            include Sere, Obelu, Imuni0si0Ona, Igbe, Irawo, Osu, Igbesu Osu,
            Erinna, Irole Oropo, Eibi, Ijasa, Oro, Agemo. Many of the above
            divinities are no longer worshipped but some e.g. Oro and Agemo have
            stood the test of time and are still worshipped annually. These
            divinities had specific times in the year when sacrifices were
            offered to them. This was their special ‘odun; hence there was an
            Odun Sere for Sere, Odun Osu for Osu and so on.
            <p>
              It is particularly significant to point out that all the
              divinities mentioned above centered around the Awujale, the King
              of Ijenuland. “Gbgobo odun lodun Oba”. The King is the chief
              celebrant of all festivals this giving irrefutable credence to the
              fact that the Awujale as the political head, is also the spiritual
              head of the land. The Awujale is thus regarded as sacred. And the
              Awujales that have joined their ancestors are deified to be
              praised, worshiped and appeased during the Odun Osu
            </p>
          </p>
          <p>
            The Odun Osu was celebrated usually in the month of December.
            Pictures of the past Awujales who have joined their ancestors are
            displayed, prayers are offered for a prosperous year, for the
            fertility of the farms, for the protection of the community from
            disease, for the happiness of the community and for the spirits of
            the dead. Pounded yam, Kolanuts and drinks are offered and dancing
            climax the rest of the Odun Osu festival. The root of our name M osu
            ro is “osu”. We have not been able to absolutely establish the link
            between the Osu festival and the osu in our name. There is no
            written record in  our family of the 19th century and beyond, This
            is to be expected. It was strictly an era of oral passage. We
            however do know from interviews with some of the aged in Ijebu-Ide
            and our family that we worshipped Osu and perhaps, featured more
            prominently in it than the other divinities worshiped up on to the
            late 19th century.
            <p>
              This leads us to conclude that if there is an association between
              Mosuro and Odun Osu, the most plausible explanation we can offer
              is that Mosuro perhaps referred to the priest or one of the
              officials charged with the annual conduct of the festival. “Eniyan
              ti o mu osu ro” (One who ensures the Odun osu holds). This may
              have been contracted for ease of call into the name Mosuro. This
              is but one explanation of the meaning of Mosuro.
            </p>
          </p>
        </div>

        {/* SECOND BLOCK OF PARAGRAPHS */}
        <div className="flex flex-col gap-y-4 lg:gap-y-8 text-justify ">
          {/* ANOTHER VERSION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8">
            <div className="relative w-full min-h-[500px]">
              <Image
                src={dummyProfileImage}
                alt="Mosuro"
                fill
                className="rounded-lg object-cover"
              />
            </div>

            <div className="flex flex-col gap-y-4 lg:gap-y-8 text-justify ">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold">
                ANOTHER VERSION
              </h1>

              <p>
                In years past, before the advent of Christianity and Islam in
                Ijebu-Ode, various indigenous modes of religious worship or
                beliefs served the people spiritually. Most of these traditional
                beliefs and the roles they played in the society are vaguely
                understood today and have suffered pejorative labelling. Many
                are now referred to and looked down upon as “primitive”,
                “heathenism” or “paganism”. The traditional divinities
                worshipped and celebrated in Ijebu-Ode include Sere, Obelu,
                Imuni0si0Ona, Igbe, Irawo, Osu, Igbesu Osu, Erinna, Irole Oropo,
                Eibi, Ijasa,
              </p>
            </div>
          </div>

          <p>
            Oro, Agemo. Many of the above divinities are no longer worshipped
            but some e.g. Oro and Agemo have stood the test of time and are
            still worshipped annually. These divinities had specific times in
            the year when sacrifices were offered to them. This was their
            special ‘odun; hence there was an Odun Sere for Sere, Odun Osu for
            Osu and so on. It is particularly significant to point out that all
            the divinities mentioned above centered around the Awujale, the King
            of Ijenuland. “Gbgobo odun lodun Oba”. The King is the chief
            celebrant of all festivals this giving irrefutable credence to the
            fact that the Awujale as the political head, is also the spiritual
            head of the land. The Awujale is thus regarded as sacred. And the
            Awujales that have joined their ancestors are deified to be praised,
            worshiped and appeased during the Odun Osu.
          </p>
          <p>
            The Odun Osu was celebrated usually in the month of December.
            Pictures of the past Awujales who have joined their ancestors are
            displayed, prayers are offered for a prosperous year, for the
            fertility of the farms, for the protection of the community from
            disease, for the happiness of the community and for the spirits of
            the dead. Pounded yam, Kolanuts and drinks are offered and dancing
            climax the rest of the Odun Osu festival.
            <p>
              The root of our name M osu ro is “osu”. We have not been able to
              absolutely establish the link between the Osu festival and the osu
              in our name. There is no written record in  our family of the 19th
              century and beyond, This is to be expected. It was strictly an era
              of oral passage. We however do know from interviews with some of
              the aged in Ijebu-Ide and our family that we worshipped Osu and
              perhaps, featured more prominently in it than the other divinities
              worshiped up on to the late 19th century.
            </p>
            <p>
              This leads us to conclude that if there is an association between
              Mosuro and Odun Osu, the most plausible explanation we can offer
              is that Mosuro perhaps referred to the priest or one of the
              officials charged with the annual conduct of the festival. “Eniyan
              ti o mu osu ro” (One who ensures the Odun osu holds). This may
              have been contracted for ease of call into the name Mosuro. This
              is but one explanation of the meaning of Mosuro.
            </p>
          </p>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
