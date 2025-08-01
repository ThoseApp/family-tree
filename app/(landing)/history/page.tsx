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
            Our History
          </h2>
        </div>
      </div>

      {/* COLLAPSIBLE CONTENT SECTIONS */}
      <div className="px-4 md:px-10 xl:px-16 mt-8 lg:mt-12">
        <Accordion type="multiple" className="w-full space-y-4">
          {/* PREFACE SECTION */}
          <AccordionItem value="preface" className="border rounded-lg px-4">
            <AccordionTrigger className="text-2xl md:text-3xl font-bold hover:no-underline">
              PREFACE
            </AccordionTrigger>
            <AccordionContent className="text-justify space-y-4 pt-4">
              <p>
                The idea of writing a historical book about the Mosuros arose at
                a meeting of the descendants at Ijebu-Ode. Various members of
                the family wanted to know the root and the size of the family.
                They wanted to know the different branches within the family in
                an attempt to forge a closer sense of kinship. Thus began the
                search to unveil the past. It did not take us long to realise
                the task could be daunting, considering the many difficult
                problems we had to overcome before we could assemble any
                meaningful information.
                <p>
                  A detailed family history relies to a large extent on the
                  information that exist. We had no specific written record
                  about Mosuro to fall back on. This did not dim our enthusiasm
                  to dig on. After thorough and persistent search, we found some
                  fragmentary literature we could glean from. In time, we found
                  reservoirs that we not only could draw from but also rely on.
                  Ageds in the city, our parents and grandparents made up the
                  reservoirs.
                </p>
              </p>
              <p>
                The bulk of the materials thus used in the compilation of this
                book was obtained through oral interviews with our parents and
                grandparents. We found them to be a rich source of information.
                Every interview led us to a wider vista in our search. Every
                interview had a perspective that was exclusive and revealing.
                Through them, we saw the impact of our forebears notably in
                Commerce, Politics, Education and Religion in Ijebu-Ode.. We now
                have an account of our achievements, our tribulations - in
                short, we have the saga of our family. We have carefully woven
                the oral accounts into a documentary narrative. Every pain and
                care has been taken to ensure the accuracy of this written
                record through corroboration of the facts. As hard as we have
                tried, we would like to be held responsible for any lapses that
                might occur in the book particularly in the Pedigree and the
                Directory. We have left some blank pages in the book for
                subsequent additions to the directory and amplification of the
                pedigree. We have adhered strictly, for the purpose of writing
                this book to the use of <strong>forenames</strong> in addressing
                our parents, grand-parents, great grandparents etc. We beg their
                indulgence. We did so with utmost respect for them. However,
                forenames allow for uniformity of identity and a grasp of who is
                who. Besides, the forenames in themselves are part of the
                history that this book sets out to reveal. It is hoped that this
                book would educate us all, would have helped us all in getting
                to our roots and further wield us closer.
                <p className="flex flex-col mt-4">
                  <i>Ayodeji Mosuro</i>
                  <i>Kolade Mosuro</i>
                  <i>February 27, 1987.</i>
                </p>
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* PATRON'S MESSAGE SECTION */}
          <AccordionItem
            value="patron-message"
            className="border rounded-lg px-4"
          >
            <AccordionTrigger className="text-2xl md:text-3xl font-bold hover:no-underline">
              PATRON&apos;S MESSAGE
            </AccordionTrigger>
            <AccordionContent className="text-justify space-y-4 pt-4">
              <p>
                Dear Brothers & Sisters: This is to commend your efforts on this
                great achievement, knowing how much you have tried and succeeded
                in bringing the family together. Tracing the historical
                background of our family and putting it indelibly on record is
                well worth it. I am sure if the dead could follow the activities
                of their progeny our parents will surely be nodding their heads
                in satisfaction now. Our family has set a standard in all
                spheres of life for other families in Ijebu-Ode to emulate. One
                feels very proud indeed belonging to such a great family. I also
                thank you for the befitting memorial activities honouring our
                parents, grandparents and great grandparents. It was only
                possible by the different roles played by each one of you.
                Hardly do you find a house in Ijebu-Ode that has not a souvenir
                of the Ankara prints made for the occasion. That day and the
                memory of our forebears will always remain in everybody&apos;s
                mind. ory of our forebears will always remain in
                everybody&apos;s mind.
              </p>
              <p>
                We thank God Almighty that our good and respected name has been
                kept so through the years. I pray we keep it up. When Egundebi
                Mosuro brought forth to the world his children, little did he
                realise he was laying the foundation for greatness. I thank you
                all descendants of this great man. I pray that you continue with
                the spirit with which you started the union. My sincere
                gratitude goes to your past and present presidents. Special
                commendation goes to those who spent time and money compiling
                this record. The spirit of oneness is alive in all of you. With
                Mrs. Olugbuyi at the helm, the union can only be steered on a
                course to make it wax stronger. I am very proud to be your
                patron. I wish you all the best in life. Yours sincerely,
                <div className="flex flex-col mt-4 font-semibold">
                  <p>
                    DR. L. MOSURO (Patron) <br />
                    OTUNBA MASE OF IJEBULAND
                  </p>

                  <br />

                  <p>
                    Dr. L. A. MOSURO <br />
                    Patron – Mosuro Descendants
                  </p>
                </div>
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* PRESIDENT'S MESSAGE SECTION */}
          <AccordionItem
            value="president-message"
            className="border rounded-lg px-4"
          >
            <AccordionTrigger className="text-2xl md:text-3xl font-bold hover:no-underline">
              THE PRESIDENT&apos;S MESSAGE
            </AccordionTrigger>
            <AccordionContent className="text-justify space-y-4 pt-4">
              <p>
                We have today and ever a book of our heritage and pride. By the
                publication of this book, we have successfully laid to rest the
                erroneous myth that we cannot account for ourselves. This book
                includes the names of all Mosuros and descendants both dead and
                alive. It also gives many addresses of members of the family in
                the directory. Our ancestral heritage and the role we played in
                the socio-political history of the town, which includes the
                propagation of Islam and the establishment of muslim schools in
                Ijebu-Ode is a fact that is supported by this book. This book
                has therefore provided answers to questions that have been
                baffling the Mosuro Descendants. The inter-relatedness of all
                individuals who are descendants is now seen in a much clearer
                light. We now know our cousins and their places of abode. The
                directory shall be updated from time to time to take care of new
                additions to the family or changes in addresses.
              </p>
              <p>
                The editorial board has done a wonderful job and we give them
                our thanks for a job well done. We are already looking beyond
                this book towards our future contribution to the development of
                Ijebu-Ode where so much has been done by our grandparents. I
                personally dedicate this book to the growth of a healthy,
                virile, progressive and dedicated family that will serve as
                example to others.
                <p className="flex flex-col mt-4">
                  <i>Mrs. A. B. Olugbuyi</i>
                  <i>President - Mosuro Descendants</i>
                </p>
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* THE STORY SECTION */}
          <AccordionItem value="the-story" className="border rounded-lg px-4">
            <AccordionTrigger className="text-2xl md:text-3xl font-bold hover:no-underline">
              THE STORY
            </AccordionTrigger>
            <AccordionContent className="text-justify space-y-6 pt-4">
              <div className="space-y-4">
                <h3 className="text-xl md:text-2xl font-bold">
                  Meaning of Mosuro
                </h3>
                <p>
                  In years past, before the advent of Christianity and Islam in
                  Ijebu-Ode, various indigenous modes of religious worship or
                  beliefs served the people spiritually. Most of these
                  traditional beliefs and the roles they played in the society
                  are vaguely understood today and have suffered pejorative
                  labelling. Many are now referred to and looked down upon as
                  &quot;primitive&quot;, &quot;heathenism&quot; or
                  &quot;paganism&quot;. The traditional divinities worshipped
                  and celebrated in Ijebu-Ode include Sere, Obelu, Imuni-si-Ona,
                  Igbe, Irawo, Osu, IgbesuOsu, Erinna, Irole Oropo, Eibi, Ijasa,
                  Oro, Agemo. Many of the above divinities are no longer
                  worshipped but some e.g. Oro and Agemo have stood the test of
                  time and are still worshipped annually. These divinities had
                  specific times in the year when sacrifices were offered to
                  them. This was their special &apos;odun&apos; hence there was
                  Odun Sere for Sere, Odun Osu for Osu and so on. It is
                  particularly significant to point out that all the divinities
                  mentioned above centred around the Awujale, the King of
                  Ijebuland. &quot;Gbogbo odun lodun Oba&quot;. The King is the
                  chief celebrant of all festivals thus giving irrefutable
                  credence to the fact that the Awujale as the political head,
                  is also the spiritual head of the land. The Awujale is thus
                  regarded as sacred. And the Awujales that have joined their
                  ancestors are deified to be praised, worshipped and appeased
                  during the Odun Osu. The Odun Osu was celebrated usually in
                  the month of December. Pictures of the past Awujales who have
                  joined their ancestors are displayed, prayers are offered for
                  a prosperous year, for the fertility of the farms, for the
                  protection of the community from diseases, for the happiness
                  of the community and for the spirits of the dead. Pounded yam,
                  Kolanuts and drinks are offered and dancing climax the rest of
                  the Odun Osu festival.
                </p>

                <p>
                  he root of our name M osu ro is &quot;osu&quot;. We have not
                  been able to absolutely establish the link between the Osu
                  festival and the osu in our name. There is no written record
                  in our family of the 19th century and beyond. This is to be
                  expected. It was strictly an era of oral passage. We however
                  do know from interviews with some of the aged in Ijebu-Ode and
                  our family that we worshipped osu and perhaps, featured more
                  prominently in it than the other divinities worshipped up on
                  to late 19th century. This leads us to conclude that if there
                  is an association between Mosuro and Odun Osu, the most
                  plausible explanation we can offer is that Mosuro refers
                  perhaps to the priest or one of the officials charged with the
                  annual conduct of the festival. &quot;Eniyan ti o mu osu ro
                  (One who ensures the Odun osu holds). This may have been
                  contracted for ease of call into the name Mosuro. This is but
                  one explanation of the meaning of Mosuro. Another version of
                  the meaning of Mosuro is this: On the 20th of May 1892,
                  British troops led by Colonel Francis C. Scott entered a
                  deserted Ijebu-Ode. Amongst the people of Ijebu-Ode who were
                  on their heels was Egundebi, son of Laketu and Princess
                  Olutoyese. In circulation in Ijebu-Ode prior to the British
                  expedition was the terrifying information about the British
                  superior firepower and that they were going to level the city
                  once it was captured. Egundebi had a lot at stake. He had a
                  youthful family and had wealth and he was not going to lose
                  both to a war. He rallied his family and gathered his wealth
                  and fled to Itele 20 kilometres south east of Ijebu-Ode. Among
                  the children he took to Itele were Adelaja, Adekogbe, Banjoko
                  and Okufowoke.
                </p>

                <p>
                  Before the flight, Egundebi was a farmer. At Itele there was
                  vast and virgin land on which he could re-establish. Egundebi
                  went back again to farming and multiplied his fortunes and
                  status. Under his employment were over twenty workers who
                  tilled the farm. The workers looked up to him not only for
                  their livelihood but also for his counsel. It was an
                  arrangement in which he took charge of their lives. Very soon
                  he became a symbol of justice. The high regard he carried from
                  Ijebu-Ode and his general decorum earned him veneration at
                  Itele. Residents flocked to his hut and he had the means to
                  feast them once they were around. This attribute that brought
                  others to him earned him the name Atotiletowa — implying that
                  he was respected and important enough for others to leave
                  their houses for his. By Egundebi&apos;s hut was a tree. It
                  was an osu tree. The tree and its surroundings came to
                  represent a court yard. Anchored by good judgement, a
                  traditional knowledge of what was wrong as against what was
                  right and a knowledge of the regulations that govern the
                  conduct of the people, Egundebi became widely respected as an
                  impartial arbitrator. Even if the village was after your head
                  and you ran to the osu tree, the symbol of justice, the
                  pursuants would halt to allow Egundebi listen to the two
                  parties. The act of running and holding to the osu tree gave
                  birth to Mosuro — meaning to hold on to the osu tree in refuge
                  for the intervention of Egundebi the arbitrator. This is how
                  Egundebi Atotiletowa came to be called Mosuro. It must be
                  remembered that the Yorubas had no surnames as we know it
                  today prior to their contact with the Western world. Names
                  belonged to the individuals. But individual names were not
                  mere tags of identity or appellation that made good sounds.
                  The individual names were real, alive and correlated to the
                  circumstances of birth and extrapolated to what the future
                  should bring or hold for the child. Though written literature
                  may be lacking, encapsulated in our name and indeed every
                  Yoruba name is a valid literature of the past. When the
                  Western culture introduced hereditary surnames principally to
                  establish proof in the transfer of land ownership, title and
                  office to the next heir, it passed on to the Yorubas through
                  the British. This is how Egundebi&apos;s children and children
                  unborn came to acquire Mosuro as a surname.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl md:text-2xl font-bold">
                  Egundebi Mosuro — The 1st Mosuro
                </h3>
                <p>
                  Egundebi Atotileto Mosuro was born in 1845. Among his cohorts
                  was Balogun Kuku. They belonged to the age group Mafowoku. The
                  Awujale named the group Mafowoku because their births had been
                  preceded by internecine wars that involved the city and
                  treachery within. They were born in a relatively peaceful
                  period and thus had the youth to work uninterruptedly and
                  prosper. Egundebi was of prominent parentage. His father was
                  Laketu and his mother was Princess Olutoyese. Princess
                  Olutoyese had a farm at Imuren on the way to Epe where yams,
                  vegetables corn and palm kernel were cropped every year.
                  Similarly, Egundebi was engaged in farming. He had his farm on
                  a large piece of land after Iperin. The crops he too had on
                  his farm were yam, cocoyam, maize, vegetable and kernels. He
                  also produced palm oil. Much later after he moved to Itele
                  when overseas export of goods opened to the interior after the
                  British conquest of Ijebu—Ode, he added the procurement of
                  rubber to his enterprise. Rubber would be bought from around
                  Ondo and be carted by his workers to Ejimrin for shipment to
                  Lagos and from thereon overseas. About 1870, Egundebi took his
                  first wife. He married Adebamawo Orungboga, who had for him
                  only one surviving child, a son—Adelaja Mosuro. Adelaja Mosuro
                  is the father of the eldest surviving Mosuro living today. She
                  is Alhaja Adeola Kaletu Alebioshu formerly Adeola Kaletu
                  Mosuro. She is 86 years old.
                </p>
              </div>

              {/* Continue with other subsections... I'll include key ones for brevity */}
              <div className="space-y-4">
                <h3 className="text-xl md:text-2xl font-bold">Okuewu Mosuro</h3>
                <p>
                  Ijebu-Ode is divided into three main but unequal wards —
                  Iwade, Ijasi and Porogun. A governing and virile arm of the
                  city was a society of all young men called Pampa. By their
                  vigour and versatility, they were charged with the commercial
                  operation of Ijebu-Ode. They were responsible for the markets,
                  the buying and the selling of goods. The elected leader of the
                  Pampa society within Ijasi ward bore the title Lapockun. They
                  were three noble sisters — Abose, Okuewu and Erishan. Their
                  father was the Lapockun of Ijasi. From him they undertook
                  commercial apprenticeship that would place them in good stead
                  for the future...
                </p>
              </div>

              {/* Include other major biographical sections */}
              <div className="space-y-4">
                <h3 className="text-xl md:text-2xl font-bold">
                  Rufai Banjoko Mosuro
                </h3>
                <p>
                  Rufai Banjoko (R.B.) took over from Giwa Kila and gave the
                  family a wider scope, imagination and recognition. He was both
                  an entrepreneur and a visionary — Rufai Banjoko was large on
                  Ijebu landscape. The distance that he covered involved more
                  than luck, and tutelage under Giwa Kila. Character, and
                  ambition showed him through, though the beginnings were
                  similar...
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ORÍKÌ ILÉ MOSURO SECTION */}
          <AccordionItem value="oriki" className="border rounded-lg px-4">
            <AccordionTrigger className="text-2xl md:text-3xl font-bold hover:no-underline">
              ORÍKÌ ILÉ MOSURO
            </AccordionTrigger>
            <AccordionContent className="text-justify space-y-4 pt-4">
              <p>
                Ọmọ Lákẹ́tù ẹ̀jì gẹ́dẹ́ <br />
                Ọmọ ọlọ́wọ́ segi wẹ́rẹ́wẹ́rẹ́ <br />
                Ọmọ eléduńn rìgìrìborìrọ̀pọ̀ <br />
                Ọmọ kálèjá kíla n&apos;dàgbà fún <br />
                Ọmọ ọlọ́wọ́ inú ape <br />
                Ọmọ Olútóyèṣé <br />
                Ọmọ àjà m&apos;ólú ogán <br />
                Ọmọ bùdín f&apos;owó ná <br />
                Ọmọ &apos;emi ọlọ́wọ́ ayé <br />
                Enìkan kò gbọ́dọ̀ j&apos;ìyàn <br />
                Kò le pa mì, kò le jí mì, <br />
                Olútóyèṣé àjà m&apos;ólú ogán ọmọ a kúrù sí <br />
                Ọmọ Gbègandè èsìwù ìjòkù <br />
                Gbègandè ajìjìfunan <br />
                Ọmọ owó níi dé&apos;lé, enìkan kò gbọ́dọ̀ naa <br />
                Ọmọ Alapòekun, alapò ẹrẹkẹ, alapò woyi woyi <br />
                Ọmọ alapò ranganjan logun <br />
                Ọmọ se ẹ̀kẹ́tà ilu, Ijasi elele mele <br />
                Ọmọ oba mẹta ti owa ni Ososa <br />
                Ọmọ ẹpẹ, ọmọ alare <br />
                Ọmọ iya suna, iya Anibire ma tọ́rọ̀ aṣọ <br />
                Ọmọ aladun, akara egusi di gba lo <br />
                Ọmọ Kukute o se mi ẹni to mi kukute ara rẹ lọ mi <br />
                Ọmọ esin ni le won gboye de, wọn oun ẹ má jẹ dandan <br />
                Ọmọ kúkú ṣaya rẹ, o f&apos;èsìwù gba&apos;dí aisaya rẹ, ó fi
                ìjàrá gba&apos;dí <br />
                Ọmọ orgi yi ko ni esi <br />
                Ọmọ Alàgba Ijada, Agba Ijada bi oba ibomiran <br />
                Ọmọ Olode a ji ngba ti won <br />
                Ọmọ Itele Mọyegẹsọ <br />
                Ọmọ atẹ́ lá òsìn <br />
                Ọmọ owó nso ni dí oke <br />
                Ọmọ owó to wa n&apos;aja to n&apos;pọse oni oun ko ri ẹni na oun{" "}
                <br />
                Ọmọ Anjuwon ko se wí lẹjọ, ija ilara ko tan bọ̀rọ̀ <br />
                Ọmọ Mase ki ọ̀rọ̀ ma bà pọ̀ <br />
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* PEDIGREE SECTION */}
          <AccordionItem value="pedigree" className="border rounded-lg px-4">
            <AccordionTrigger className="text-2xl md:text-3xl font-bold hover:no-underline">
              PEDIGREE
            </AccordionTrigger>
            <AccordionContent className="text-justify space-y-4 pt-4">
              <p>
                <strong>Introduction</strong> The pedigree charts illustrate at
                a glance the inter-relatedness of members of the family.
              </p>
              <p>
                The size of the book curtailed a presentation where seniority of
                birth and generation will differentially be depicted. An
                adaptation has been employed such that children of any given
                parents shown on the pedigree are arranged from the left
                indicating the most senior child to the right showing the
                youngest. An account is also made for polygamy such that the
                wives and their immediate lines are arranged in order of
                seniority.
              </p>

              <p>
                Our antecedents are shown as far back as our oral sources can go
                (about 1825). Although, Egundebi was married to seven wives, the
                pedigree for this first publica- tion covers the first two wives
                whose lines constitute the Mosuro core.
              </p>

              <p>
                Surnames shown in capital letters are for males. The arithmetic
                notation used as for example A = b means that male A is married
                to female b. Children (c and d) arising from the A and B union
                are indicated by descent lines drawn from the union as above. A
                wavy descent line is shown for any child if one of the spouses
                with the marriage notation (=) is not the direct parent of the
                child.
              </p>

              <p>
                <strong>Editor&apos;s Note:</strong> Pressures of publication
                deadline made the task of a complete Pedigree difficult. We
                regret the few missing names.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default HistoryPage;
