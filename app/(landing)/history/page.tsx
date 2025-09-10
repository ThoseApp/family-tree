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
        <PageHeader title="History" />
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
                  information that exists. We had no specific written record
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
                this book to the use of forenames in addressing our parents,
                grand-parents, great grandparents etc. We beg their indulgence.
                We did so with utmost respect for them. However, forenames allow
                for uniformity of identity and a grasp of who is who. Besides,
                the forenames in themselves are part of the history that this
                book sets out to reveal. It is hoped that this book would
                educate us all, would have helped us all in getting to our roots
                and further wield us closer.
                <p className="flex flex-col mt-4">
                  <i>Ayodeji Mosuro</i>
                  <i>Kolade Mosuro</i>
                  <i>February 27, 1987.</i>
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
                memory of our forebears will always remain in everybody’s mind.
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

          {/* PRESIDENT&apos;S MESSAGE SECTION */}
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
                  “primitive”, “heathenism” or “paganism”. The traditional
                  divinities worshipped and celebrated in Ijebu-Ode include
                  Sere, Obelu, Imuni-si-Ona, Igbe, Irawo, Osu, IgbesuOsu,
                  Erinna, Irole Oropo, Eibi, Ijasa, Oro, Agemo. Many of the
                  above divinities are no longer worshipped but some e.g. Oro
                  and Agemo have stood the test of time and are still worshipped
                  annually. These divinities had specific times in the year when
                  sacrifices were offered to them. This was their special ‘odun’
                  hence there was Odun Sere for Sere, Odun Osu for Osu and so
                  on. It is particularly significant to point out that all the
                  divinities mentioned above centred around the Awujale, the
                  King of Ijebuland. “Gbogbo odun lodun Oba”. The King is the
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
                  The root of our name M osu ro is “osu”. We have not been able
                  to absolutely establish the link between the Osu festival and
                  the osu in our name. There is no written record in our family
                  of the 19th century and beyond. This is to be expected. It was
                  strictly an era of oral passage. We however do know from
                  interviews with some of the aged in Ijebu-Ode and our family
                  that we worshipped osu and perhaps, featured more prominently
                  in it than the other divinities worshipped up on to late 19th
                  century. This leads us to conclude that if there is an
                  association between Mosuro and Odun Osu, the most plausible
                  explanation we can offer is that Mosuro refers perhaps to the
                  priest or one of the officials charged with the annual conduct
                  of the festival. “Eniyan ti o mu osu ro (One who ensures the
                  Odun osu holds). This may have been contracted for ease of
                  call into the name Mosuro. This is but one explanation of the
                  meaning of Mosuro. Another version of the meaning of Mosuro is
                  this: On the 20th of May 1892, British troops led by Colonel
                  Francis C. Scott entered a deserted Ijebu-Ode. Amongst the
                  people of Ijebu-Ode who were on their heels was Egundebi, son
                  of Laketu and Princess Olutoyese. In circulation in Ijebu-Ode
                  prior to the British expedition was the terrifying information
                  about the British superior firepower and that they were going
                  to level the city once it was captured. Egundebi had a lot at
                  stake. He had a youthful family and had wealth and he was not
                  going to lose both to a war. He rallied his family and
                  gathered his wealth and fled to Itele 20 kilometres south east
                  of Ijebu-Ode. Among the children he took to Itele were
                  Adelaja, Adekogbe, Banjoko and Okufowoke.
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
                  their houses for his. By Egundebi’s hut was a tree. It was an
                  osu tree. The tree and its surroundings came to represent a
                  court yard. Anchored by good judgement, a traditional
                  knowledge of what was wrong as against what was right and a
                  knowledge of the regulations that govern the conduct of the
                  people, Egundebi became widely respected as an impartial
                  arbitrator. Even if the village was after your head and you
                  ran to the osu tree, the symbol of justice, the pursuants
                  would halt to allow Egundebi listen to the two parties. The
                  act of running and holding to the osu tree gave birth to
                  Mosuro — meaning to hold on to the osu tree in refuge for the
                  intervention of Egundebi the arbitrator. This is how Egundebi
                  Atotiletowa came to be called Mosuro. It must be remembered
                  that the Yorubas had no surnames as we know it today prior to
                  their contact with the Western world. Names belonged to the
                  individuals. But individual names were not mere tags of
                  identity or appellation that made good sounds. The individual
                  names were real, alive and correlated to the circumstances of
                  birth and extrapolated to what the future should bring or hold
                  for the child. Though written literature may be lacking,
                  encapsulated in our name and indeed every Yoruba name is a
                  valid literature of the past. When the Western culture
                  introduced hereditary surnames principally to establish proof
                  in the transfer of land ownership, title and office to the
                  next heir, it passed on to the Yorubas through the British.
                  This is how Egundebi’s children and children unborn came to
                  acquire Mosuro as a surname.
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
                  for the future.
                </p>

                <p>
                  Their mother was a princess from Ososa. They were direct grand
                  daughters of the Gbegande of Ososa. By this direct link to the
                  throne of Ososa, their children would be princes and
                  princesses of Ososa and thus one of them could be eligible to
                  ascend the throne. By birth the three sisters were well
                  connected, for they had prominent parents on both sides —
                  matrilineally, they were blue blooded and patrilineally their
                  father was an important man of repute and power. Okuewu was
                  Egundebi&apos;s second wife. We do not have information about
                  the courtship between Egundebi and Okuewu. We do know however,
                  that it was a period when women of marriageable age were
                  sought after by female members of the male family. The first
                  stage is a loose linkage when a girl in her youth is marked
                  for a particular man. From that point to maturity, there is
                  time to understand the two homes to assure worthiness and
                  compatibility of families, there is also time for the man and
                  the woman to develop an affection for each other and finally
                  the relationship is culminated by the parents&apos; blessings
                  and consent. Egundebi&apos;s family got the consent of
                  Okuewu&apos;s family and they both got married about 1875.
                  Egundebi was to marry five other wives making a total of seven
                  wives in his life time. Polygamy then was by and large
                  exclusive to the rich. Egundebi&apos;s farm supplied him with
                  enough means to comfortably support a large family. Although
                  Adebamawo Orungbogu, Egundebi&apos;s first wife gave birth to
                  a son, it was Okuewu that bore the sons that carried the
                  family name Mosuro on. Her line was to become the fountain for
                  the future. Okuewu was respectable but initially not
                  venerable. For a woman must be a good wife and a mother before
                  she was venerable. Okuewu had the misfortune of losing a
                  number of children in infancy. In those days, infant mortality
                  was attributed to a fraternity of demons in the wilderness
                  whose stay on earth was short-lived and who had a pre-arranged
                  date of departure. Their mangled bodies were buried in the
                  wilderness such that they would part company with the demons
                  and return again at birth to stay. Such was the trauma Okuewu
                  went through by the loss of her children at infancy. She
                  however lived above her misfortunes to forge on with her
                  business. Okuewu was into commerce from the beginning having
                  been reared by parents who were into trading. She would buy
                  textile from the coastal market at Ejimrin. The goods she
                  bought were brought to Ejimrin from Lagos and she resold them
                  at Ijebu—Ode and Ososa. Ososa was special to her. She knew the
                  place well for therein was her root. Consequently she had a
                  feel for their commercial needs. In meeting these needs,
                  prosperity came through providing the required goods where the
                  consumers desired them. When Okuewu had a son with all the
                  good signs that he would live, he was aptly named Adekogbe and
                  Gbokoyi. Adekogbe means the prince has rejected the wilderness
                  and Gbokoyi means the wilderness has refused to accept this
                  one. The names are in clear reference to the wilderness or
                  bush where deceased babies were disposed of after death. The
                  prince on the other hand is in reference to royal lineage both
                  with Ijebu—Ode and Ososa. Adekogbe&apos;s father, Egundebi was
                  born by Princess Olutoyese of Ijebu—Ode and his mother Okuewu
                  was a direct descendant of the Gbegande of Ososa. As fortune
                  would have it, Okuewu had two other surviving children after
                  Adekogbe. His immediate younger brother was named Banjoko,
                  meaning literally “sit down with me”. The name Banjoko is an
                  allusion to the past. It implies that this one is not going
                  into the wilderness and that he is going to stay with his
                  parents. The last born was a girl. She was named Okufowoke.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl md:text-2xl font-bold">
                  Adekogbe Gbokoyi Mosuro
                </h3>
                <p>
                  Adekogbe Gbokoyi Mosuro was born at about 1881. He belonged to
                  the Obaleye age group. They were called Obaleye in
                  commemoration of the very warm reception accorded Awujale
                  Fidipote when his body was brought back to Ijebu—Ode from Epe
                  where he died in self exile. From childhood, Adekogbe’s build
                  was cut. He had a small frame. A frame that in the future
                  would support an eminent stature. He had a handsome and
                  luxuriant dark skin with a face showing slightly high cheek
                  bones. Distinctive on the cheeks were three perpendicular
                  facial marks on each cheek, each stroke about one and a half
                  inches long. They were the Ijebu facial marks. The facial
                  marks now in the decline today, served to differentiate the
                  various Yoruba ethnic families from one another. Adekogbe was
                  about ten years old when his parents took the family and fled
                  to Itele as the British troops prepared for an expedition to
                  Ijebu—Ode in 1892. His first stint and occupational exposure
                  was with his father. It was of course farming. But this was
                  short lived. With his mother, he had been introduced into the
                  intricacies of trading. In his youth, he along with Awawu,
                  Okuewu’s maid would cart goods on their heads and follow
                  Okuewu to Ejimrin to purchase goods and then to Ososa to sell
                  the goods. It was a training Banjoko and Okufowoke would
                  equally undergo. Much later when they graduated from such
                  chores, it was Adekogbe’s, Banjoko’s and Okufowoke’s first
                  children that undertook the assignments. Contrary to
                  expectations, the British troops did not level Ijebu—Ode when
                  they took over the city. A Briton was installed as district
                  head, commerce within the hinterland was no longer restricted
                  to the border posts and the city benefited from increased
                  trade. Christianity which was the conqueror’s religion gained
                  easier access and protective support.
                </p>

                <p>
                  Because he successfully settled at Itele, Egundebi now had two
                  homes. His family quarter at Ita Ntebo in Ijebu—Ode and his
                  farm settlement at Itele. He commuted between both as the
                  situation demanded, while Okuewu and her children returned to
                  his bungalow house at Ita Ntebo. By the time they returned to
                  Ijebu—Ode, Islam which had been lurking in the background up
                  until about 1890 began to gain major converts. Awujale Tunwase
                  gave the religion recognition and support. Mosques sprang up
                  in the different quarters of the city. Affiliated to many of
                  the growing mosques were Arabic schools (Ile Kewu) where
                  students were tutored in Arabic and the Islamic Faith.
                  Adekogbe was enrolled at the Arabic school in Ikanigbo Mosque
                  under the tutorship of Alfa Abdul Qadir. Among his colleagues
                  at the school were Hadji Kokewukobere and Hadji Akewusikisa.
                  It was at this point that Adekogbe became a Muslim. He took a
                  full bath of cleansing into the new religion and took a muslim
                  name. In order to preserve his initials A.G, he dropped
                  Adekogbe for Abdul—Kareem. Ironically, one of Abdul—Kareem’s
                  children became a christian. To preserve his own initials F.A.
                  (Fasasi Adewumi), Fasasi was changed to Francis. In a similar
                  conversion exercise, Okuewu took up Awawu as an additional
                  name, while Banjoko added Rufai to his and Okufowoke added
                  Jeminatu to hers. Egundebi on the other hand remained
                  Egundebi, but two acts of his are worthy of mention. One, he
                  like the rest of the Mafowoku age group joined and
                  participated in a conversion ceremony with Balogun Kuku when
                  he opened his “Olorunsogo” new house and mosque at Ntebo
                  Street, in 1902. It was an occasion in which several
                  dignitaries in Ijebu—Ode declared for Islam. Second, it was
                  Egundebi who offered the Ita Ntebo community a piece of his
                  land on which the Ita Ntebo mosque abutting our family house
                  stands. The mosque was initially built about 1903. Between the
                  Arabic school and helping Okuewu, Abdul—Kareem became a
                  tailor. He would sew caps known as Etu while Rufai Banjoko,
                  his younger brother would market them to as far as Egba
                  province. He possessed such skill that he sewed and
                  embroidered Agbada by hand. For his skill, he was awarded a
                  government sewing assignment. He sewed the uniform of prison
                  officials. For the city at large, members of the Obaleye group
                  and prominent men of the city came to him for their ceremonial
                  outfits and for the latest cut in trend. Because he was a man
                  of great energy and because he had a natural calling for
                  business, Abdul–Kareem devoted a disproportionate amount of
                  his time to trading. By the turn of the century, slave trade
                  had permanently ceased and Lagos shore was now laden with
                  European goods in exchange for raw materials from the
                  hinterland. Initially, Abdul–Kareem bought the goods that he
                  sold at Ejimrin, later on he measured his risk and went direct
                  to the source in Lagos. A trip to Lagos for the procurement of
                  goods was a well planned programme. The travelling party would
                  converge at Oyingbo and journey on foot to Ejimrin, a distance
                  of about 20 kilometres. Progress came years later when the
                  party rode on black Hudson bicycles and thus cut his journey
                  short. The men rode the bicycles while the accompanying
                  children rode on the bars connecting the bicycle handle and
                  the seat. Empty sacks to be used in packing the purchased
                  goods were stacked behind the adult rider. At Ejimrin, the
                  bicycles were deposited in a bicycle park in care of a
                  caretaker for a fee. A night of rest would be spent at
                  Ejimrin, for the journey to Lagos by sea commenced at dawn.
                  The canoe was a bare hulk controlled by twelve oarsmen. From
                  paddling against the waves, they had bulky biceps to show for
                  it. They had no navigational instruments, just a good sense of
                  direction, of the sea and its behaviour. If the sea was unruly
                  or was going to be unruly midstream, the departure was delayed
                  for it to calm. Once in water, they were at the mercy of the
                  vagaries of the wind system while death below the canoe star
                  ed at them. The risk was high but equally high was; the stake.
                  Undaunted, Abdul–Kareem relegated the risk for the stake. He
                  pursued his business to Lagos. Evening found them travel –
                  weary as they disembarked at Idumagbo in Lagos. Some few years
                  later, Asani Kose from Porogun had seen a machine imported to
                  Lagos and ordered for it. It was an engine which when attached
                  to the canoe eliminated the services of the oarsmen and
                  propelled the canoe faster. The journey from Ejimrin to Lagos
                  and back became shorter but nevertheless hazardous. There were
                  several stores to purchase textile and other goods from. The
                  party would spend about four days in Lagos combing separately
                  around for the best deals. However, PZ and John Holt Stores
                  were Abdul–Kareem’s favourites. They offered the widest and
                  latest collection from U.K. and their prices made the risk
                  worth the venture. Besides, PZ officials were particularly
                  receptive to him. They allowed him the use of their warehouse
                  to sack his goods for his return journey to Ejimrin. Because
                  goods followed them back to Ejimrin, the return trip to
                  Ijebu–ode was modified. Abdul–Kareem would transfer at Ejimrin
                  to smaller canoes for Ebute Eriwe. It was from here porters
                  would cart the goods to Ijebu–Ode. Lagos was more than a
                  commercial centre. There was a lot to observe in it. Fashion
                  took its root from Lagos before spreading to the interior.
                  Lagos had intercoursed with the world and acquired
                  sophistication which the hinterland either scorned or tried to
                  copy. By 1900, Christianity had gained a strong foothold in
                  Lagos so also had Islam. The observable difference between
                  both religions lied in education.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl md:text-2xl font-bold">
                  Jeminatu Anjuwon Okufowoke Mosuro
                </h3>
                <p>
                  Okufowoke was Okuewu&apos;s last born. She was born about 1890
                  and belonged to the Obase age group. Nature endowed her with
                  beauty and she was born into riches. She had not only wealthy
                  parents, she also had two senior brothers who had succeeded in
                  business. This gave her a head start in life. She followed
                  Okuewu on her trading missions to Ejimrin and Ososa.
                </p>

                <p>
                  In spite of the riches around her and the early success she
                  made herself in commerce, she comforted herself humbly. Her
                  decorum, her status and fortunes were matters of envy to many
                  women in the city. Because there was so much envy about her,
                  she acquired an attributive name — Anjuwon — implying that her
                  natural conduct will always be enviable. Whenever relations or
                  friends wanted to express their endearment for her the name
                  Anjuwon was commonly used. Some relations regularly used the
                  attributive name and better knew her by Anjuwon than her real
                  name. By about the age of twenty in 1910, Anjuwon Okufowoke
                  was married to Kadri Onanuga. The future was bright and her
                  family hopes were high. Nature however dealt a blow on her
                  when she lost a first child in infancy. A second birth
                  survived and she was named Saratu Kokumo Malomo Onanuga. She
                  lived as the only surviving offspring of Okufowoke. Saratu
                  took after her mother and became a perfect mould of good
                  naturedness and a woman whose natural grace endeared her to
                  all who come into contact with her. She is today known and
                  recognised far and beyond as Mama Sunmoya or Mama Oke—Ola
                  Alaso Oke.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl md:text-2xl font-bold">
                  Egundebi&apos;s death
                </h3>
                <p>
                  Egundebi was at Itele when Adelaja died. This was about 1910.
                  Egundebi himself was by then very frail. He was borne after
                  the burial of Adelaja in a makeshift carriage by his workers
                  to his Ita Ntebo residence at Ijebu—Ode. In 1912 Egundebi died
                  and his body like his son&apos;s was interned at his home in
                  Ita Ntebo. It was the custom before cemeteries came about in
                  Ijebu—Ode to bury princes and princesses in their homes. Six
                  feet under, in what is now Desalu Mosuro&apos;s room lies the
                  remains of Egundebi. Similarly, the remains of Adelaja is
                  under the area around the door leading to Adawiyat
                  Mosuro&apos;s room.
                </p>
                <p>
                  When Egundebi died, Abdul—Kareem, Rufai Banjoko and Okufowoke
                  were the most grown of the remaining children. To their
                  credit, all three were wealthy. Flanked by their respective
                  age groups, the three siblings threw a lavish burial ceremony
                  in memory of their late father. The reception of guests
                  following the burial took place at Iyamro in front of the
                  Odumosu house (Ojude Odumosu). It was an open field that could
                  take a large gathering. Abdul—Kareem, Rufai Banjoko and
                  Okufowoke were elegantly dressed for the ceremony. They wore
                  an expensive outfit known as &quot;Kilero&quot; which was the
                  first of its kind in Ijebu—Ode. They sat conspicuously apart
                  on a stage with protective glass encasing them in a noble
                  fashion. It was a lavish ceremony that was stage managed by
                  Abdul—Kareem. Not long after Egundebi died, Abdul—Kareem moved
                  along with his family and mother to reside at 36 Italupe
                  street where a family bungalow had been built to accomodate
                  the three royal sisters Erishan, Okuewu and Abose now
                  respectively called Iya Araba, Iya Italupe and Iya Ijasin.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl md:text-2xl font-bold">
                  Okufowoke&apos;s death
                </h3>
                <p>
                  In 1922, Okufowoke went into labour for her third birth.
                  Something seriously went wrong. She died during childbirth
                  bringing life to an abrupt end for her in her prime.
                  Okufowoke&apos;s death was a painful loss for her family and a
                  major blow for her mother Okuewu — Iya Italupe. Mothers like
                  to have children but a daughter is special. Okufowoke&apos;s
                  death brought again to the fore for Iya Italupe her child
                  rearing trauma which she had hoped was now permanently behind
                  her. Death is an inevitable occurrence of life but it is
                  considered an abomination in the Yoruba setting if the
                  children as adult should die before the parents. For children
                  to outlive their parents is a human desire, unfortunately
                  death will come when it will without heed to societal norms or
                  wishes. The solace to Okufowoke&apos;s death was that she left
                  a daughter, Saratu, behind. To Saratu, Okuewu (Iya Italupe)
                  vowed to herself that she would not be denied any motherly
                  care and affection. It was a commitment Okuewu took up. Saratu
                  came into her ward and she lavished on her love, care and
                  attention.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl md:text-2xl font-bold">
                  Western Education, Islam and the Kila Society
                </h3>
                <p>
                  The entry of the christian missions precipitated a
                  proliferation of churches and ultimately an educational
                  revolution. The first schools that sprang up were parochial.
                  The rule of thumb was that christian children gained easier
                  entry to the schools. Children belonging to other religious
                  sects particularly Islam had to be converted to Christianity
                  either at the point of entry or on entry before they could
                  partake of school. The Muslims in Lagos because of
                  apostatization in the Mission schools held their children back
                  from Western education. It was a problem Sir C.A. Moloney and
                  later Sir C.T. Carter, Governor of Lagos would wade into
                  without appreciable success. In an attempt to solve the issue
                  of whether or not to embrace Western education, the Muslim
                  Community in Lagos decided to write and seek the advice of the
                  Sultan of Turkey Abd al—Hamid II on the matter. Turkey was
                  reported at this time to be in the fore in Pan Islamic
                  affairs. The Sultan wrote back in 1894 urging the Muslim
                  community to accept Western education. To further support his
                  reply, the Sultan despatched to Lagos his personal
                  representative, Abdul Quillam, who was a graduate of Western
                  education, to demonstrate the importance of accepting Western
                  education. Abdul Quillam was a lawyer and at the time he was
                  despatched to Lagos by the Sultan, he was the President of the
                  Muslim Society in Liverpool, U.K. Quillam during his visit to
                  Lagos opened the Shitta Bey mosque in Lagos in July 1894 and
                  left behind with the Muslim community, an impressionable mark
                  on why they should accept Western education and how education
                  could be acquired without any harm to Islam. Soon after his
                  departure, a society of progressive Muslims was formed in
                  Lagos after Quillam. It was called Kila society (Egbe Kila).
                  Kila being the Yoruba transliteration of Quillam. The Kila
                  Society brought pomp to the propagation of Islam and quickly
                  spread to many Yoruba cities. Abdul—Kareem and his travelling
                  party frequented Lagos for commerce but also took attractive
                  notice of the Kila society. It was a society worth importing
                  to Ijebu—Ode. When the Kila society was formed in Ijebu—Ode,
                  Abdul—Kareem Gbokoyi Mosuro was elected as the Giwa (the
                  President). Thereon, his peers, all and sundry, from
                  instinctive affection and respect, elected to call him by the
                  name which for them had the most meaning, Giwa Kila. The Kila
                  society of Ijebu—Ode was a class apart. Essentially, they
                  featured prominently in the propagation of Islam but they did
                  it with so much gaiety. A band would herald their entry and
                  would lead them on the streets to Muslim activities. They were
                  adored and greatly admired by the city. They were men of means
                  and wore the most fashionable outfits. It has been widely
                  reported that when the Prince of Wales Prince Edward visited
                  Abeokuta in 1926, the President of the Kila society of
                  Abeokuta was so elegantly dressed and so distinguished that
                  the Prince Edward mistook him for the Alake (the King of
                  Abeokuta) and first moved towards him for a handshake. Such
                  was the calibre of men that led the Kila societies in the
                  various Yoruba cities. Giwa Kila Mosuro was born to his role.
                  He was magnetic and genuinely merry. Everything about Giwa
                  Kila was fanfare. He was a hedonist as well as a disciplined
                  and organized businessman. He had a natural feel for
                  entertainment and fair for clothes. He is perhaps the most
                  vivacious Mosuro that has ever been. In his time, there was no
                  household in Ijebu—Ode that did not know of the Kila society
                  and very few if any who did not know Giwa Kila. Through
                  pageantry, the Kila society dignified Islam and drew
                  overwhelmingly to it converts across all ages. In what became
                  a family devotion, (Awawu Okuewu Mosuro (Iya Italupe) became
                  the leader of the women muslims in Ijebu—Ode and earned for
                  herself the muslim leadership title — Iya Sunna. For Giwa
                  Kila, three means of income served his livelihood. He owned a
                  retail store at Italupe where he sold caps, singlets,
                  textiles, pants and provisions. He was a tailor of repute. He
                  was also a timber merchant. It is on record that the first
                  hammer permit No. IJ.1. issued in Ijebu province for selling
                  trees was issued to Giwa Kila. Giwa Kila basked in fame and
                  was also embroiled in controversy. He was the patron of the
                  Obabekos&apos; — an age group about fifteen years younger than
                  his age group. Within the Obabeko group was a man popularly
                  known as Captain. Captain dated Abadatu from Iyanto.
                  Abadatu&apos;s mother had other ideas. She was a friend to Iya
                  Italupe, Giwa Kila&apos;s mother and she wanted her daughter
                  married to Giwa Kila. In realization of this goal,
                  Abadatu&apos;s mother brought her daughter over to Giwa Kila
                  who accepted the offer. Giwa Kila exercised poor judgement in
                  this regard when he took Abadatu. For one he knew all about
                  the relationship between Captain and Abadatu. Two, Captain
                  belonged to the Obabeko group and Giwa Kila was their patron
                  and model. A social feud thus ensued as a result of the
                  matter. The Obabeko group rejected Giwa Kila as their patron
                  for lack of judgement on the Abadatu affair. They gathered
                  together and burnt Giwa&apos;s effigy in front of his house.
                  They also went about the city derisively referring to Giwa
                  Kila as a “short devil” and a man not worthy of the
                  city&apos;s respect. Giwa Kila did not buckle under
                  Obabeko&apos;s denounciation, instead he rallied his peers,
                  his family and his supporters and with the accompaniment of
                  drums danced round the city refuting all allegations against
                  him. Giwa Kila used fanfare to turn a bad case to his
                  advantage. The Obabeko&apos;s jeerings dented him very little.
                  In the end, Giwa Kila gave in after elders and the Awujale
                  intervened. Abadatu returned to Captain, the Obabekos came
                  back and begged Giwa Kila to assume his fatherly role again.
                  Giwa Kila once again became the patron of the Obabekos. As a
                  great gesture to prove that the rift was now amicably resolved
                  and to further enhance friendship with Abadatu&apos;s family,
                  one of Giwa Kila&apos;s daughters Rabiatu (Iya Idogo) was
                  married to Abadatu&apos;s brother Lawal Okuwobi at Odegbo. In
                  1931 Giwa Kila was invited to Ososa to ascend the Gbegande
                  throne. He felt highly honoured. He felt all the more honoured
                  that he could be called to ascend the throne when he was not
                  resident in the city. However, Giwa Kila in spite of pressures
                  around him to ascend the throne decided he was not going to be
                  king at Ososa. Giwa Kila had carved for himself a social
                  kingdom at Ijebu—Ode where he was king. No other status
                  outside of Ijebu Ode could be higher. In place of him, he
                  presented three relations as candidates to the regency at
                  Ososa. Albert Onasamwo a nominee from Giwa Kila&apos;s
                  selections was eventually chosen and crowned the Gbegande of
                  Ososa. Shortly after the royal search for the Gbegande of
                  Ososa, Giwa Kila took ill. He returned from Jumat service on
                  Friday June 12, 1931 and thereafter collapsed. His youngest
                  wife, Aduke became hysterical. She cried for help and between
                  yells announced that Giwa Kila was dead. Awawu Okuewu, Iya
                  Italupe, Giwa Kila&apos;s mother was in the house when all
                  these happened. She had struggled hard and gone through
                  incalculable pains to rear children. She had nurtured them
                  with pride and dignity and one by one life was playing a
                  mirage on her. Okufowoke, her daughter died in her prime. Now
                  Giwa Kila was dead. All these thoughts weighed her down and
                  sent her into deep depression. There was only one way out. She
                  called Saratu and sent her down the street for caustic soda.
                  Saratu innocently did as she was told. Iya Italupẹ swallowed
                  caustic soda in a suicidal bid and lapsed into coma. It was a
                  hectic Friday. Dr. Nathaniel Taiwo Olusoga the family doctor
                  and the first Ijebu Medical doctor had been called to the
                  scene. Ironically, Giwa Kila died around while Iya Italupẹ
                  remained in stable but unconscious state for many days. On the
                  early hours of Thursday June 18 1931, six days after he had
                  initially collapsed at home, Giwa Kila died. He was aged 50.
                  When Giwa Kila died and while he was buried, Iya Italupẹ
                  remained unconscious. Iya Italupẹ had been partially saved
                  from the poison she took by the caustic nature. Her system
                  vigorously rejected it because she vomited and stooled a great
                  deal. Dr. Olusoga put his training and experience to play and
                  finally brought her round. With time Iya Italupẹ regained her
                  old self and accepted life and its vicissitudes. The suicidal
                  bid now left a permanent scar in her mouth — a painful
                  reminder of the past. Iya Italupẹ had now been tempered by
                  life and came to appreciate it better. There is joy in having
                  children but grandchildren rekindle grandparents in a very
                  special way. She took to her grandchildren adorably. They
                  found in her a remarkable woman of gentle touch who was the
                  paragon of the household. Everyone in the house gravitated to
                  her direction. She was now the centre of the family life.
                  There was always more than enough to eat at Iya
                  Italupẹ&apos;s. Nobody else showed as much compassion and
                  understanding in the house than Iya Italupẹ. There was room in
                  her heart for everyone for a warm embrace. It was to her
                  grandchildren and their families that she devoted the rest of
                  her life. Iya Italupẹ died on July 17, 1945 and to this day
                  idolatry memories from the grandchildren she cared for have
                  not waned with time. She was genuinely loved and lovable.
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
                  similar. Rufai Banjoko (R.B.) was born in 1885 and thus
                  belonged to the Obayori age group. Children born between 1885
                  and 1888 were assigned Obayori age group by the Awujale in
                  reference to Oba Fidipote who joined his ancestors as the last
                  Awujale before the British assault of 1892. Oba Fidipote by
                  his translation was saved from the assault. The fortune of the
                  Awujale Fidipote in not participating in this war is referred
                  to as Obayori. Whereas Giwa Kila undertook his arabic and
                  islamic education from Alfa Abdul Quadir at Itanigbo mosque,
                  Rufai Banjoko (R.B.) took his lessons from Alfa Ashiru Alawiye
                  at Iyanro mosque. From the beginning, R.B. had a devotion to
                  religion that stood him apart. While Giwa Kila practiced it
                  with “gaiety”, R.B. attuned himself humbly to the will of
                  Allah and maintained a closeness to Allah in his daily
                  activities. To him, religion was a living force and he gave it
                  all the required obligation. He was a devoted Muslim to the
                  core. As far as commerce was concerned, it was to his senior
                  brother Giwa Kila that he apprenticed. He was always following
                  Giwa Kila and very much a part of the business. When Giwa Kila
                  made the caps, R.B. was on hand to hawk them around for sales.
                  When together at home, Giwa Kila offered R.B. tailoring
                  lessons until he too acquired proficiency. R. B. had a dream.
                  As a teenager, he had been on the sideline when Balogun Kuku
                  opened his Olorunsogo house in 1902. R. B. had watched the
                  ceremony and savoured every detail of it. He had a dream that
                  if he worked hard and the future paved well for him, he would
                  erect a house that would draw all to see. His dream house
                  would not only be symbolic, it would be functional. The house
                  would make provision for his children to bring in their wives
                  and children. It would garrison all his family and his
                  children&apos;s family together and it would rise to the sky.
                  That was his dream.
                </p>

                <p>
                  <strong>To this dream he set to work.</strong> He followed
                  Giwa Kila to Ejinrin and to Lagos to buy merchandise such as
                  textiles, singlets, handkerchiefs etc and quickly learnt the
                  ropes. He maintained mobile sales on foot to as far as Egbado
                  province. The thought struck him after the many foot and
                  bicycle trips to Ejinrin that if he provided a motor vehicle
                  that would cart goods and people back and forth from Ejirin
                  and Ijebu-Ode, the traders&apos; burden will be eased and
                  gains would also accrue him. That was R. B. A shrewd and
                  imaginative businessman who was able to see the future and
                  carve it up. In his vision he had calculated a service that
                  would endear him, at a price. Through the assistance and
                  connection of Giwa Kila, R.B. obtained his first Reo lorry
                  assigned to convey passengers and goods to and from Oyingbo
                  and Ejinrin markets. It was a successful venture that
                  transformed him into a transportation magnate thus towering
                  him above many other businessmen in the city. By about{" "}
                  <strong>1920</strong> R.B. now had his own retail store at the
                  family bungalow house at Ita Ntebo where he sold caps and
                  textile. Giwa Kila&apos;s shop on the other hand was at
                  Italupẹ. Giwa Kila&apos;s store carried textile along with
                  provisions. Both of them were now financially successful. With
                  financial success, R.B.&apos;s family grew. Polygamy set in
                  and his children increased in number. His passion for religion
                  passed on compulsorily to the children. Arabic and Islamic
                  education began for all at youth at the arabic schools
                  affiliated with the many mosques. In 1926 an Islamic religious
                  record was set in Ijebu-Ode. Two men from Ijebu-Ode set out on
                  pilgrimage to Mecca. Another followed in 1928. From 1927, R.B.
                  nursed a desire to go to Mecca and prepared towards it. There
                  was some mystique about going to Mecca. Primarily, it was
                  rigidly religious. You qualified to go having fulfilled in
                  letter and in spirit the other required tene ts of the Islamic
                  faith. Mecca was the ultimate. There was also the glamour of
                  this war is referred to as Obayori. Mecca was the ultimate.
                  There was also the glamour of this war is referred to as
                  Obayori. But by and large it was a religious affair. And
                  overseas adventure and intercourse. You were observed
                  differently once you returned from Mecca, you returned clean.
                  You were expected to live up to the expectation and perception
                  of the general public. They expected of you nothing short of
                  religious ascetism. The early pilgrims lived up to the
                  expectation and perception of the general public. R.B. Mosuro
                  could aspire to religious piety as Islam was the bedrock of
                  his personal and public life. On 1st of March, 1929, R.B.
                  Mosuro and Kadiri Borokini a friend who lived directly
                  opposite the Mosuro Ita Ntebo house, set out on a pilgrimage
                  to Mecca. Other pilgrims from Ijebu-Ode before them went to
                  Mecca the long and arduous way. They went by road on a journey
                  that included trekking. R.B. Mosuro and Kadiri Borokini were
                  trail blazers for they went by sea. R.B. and Kadiri Borokini
                  were bound together beyond being neighbours. They both with a
                  minority group stood firmly in support of Awujale Daniel
                  Adesanya in 1942 when attempts were being made to abdicate
                  him. It was a just and principled stance that cost Kadiri
                  Borokini for about ten years, the office of Ijebu-Ode&apos;s
                  chief Imam. Following a court injunction and the intervention
                  of Hadji Abbas and others, the matter was amicably resolved
                  and Hadji Kadiri Borokini became the chief Imam of Ijebu-Ode
                  in 1953. Before then something stronger held R.B. and Borokini
                  together. R. B. took Adaiwyat as his last wife, Adaiwyat being
                  the daughter too Hadji Borokini. While away to Mecca,
                  R.B.&apos;s business was fully established enough to maintain
                  smooth operation without him, although Giwa Kila was close by
                  to oversee it all. The pilgrimage to Mecca took close to nine
                  months. When he returned to Lagos, advance notice of his
                  arrival in Ijebu-Ode was sent to Giwa Kila. An elaborate
                  arrangement in which the family, relations, friends and his
                  workers wore uniform outfits and danced to give him a heroic
                  welcome at Ejinrin was made. By the end of 1929, Hadji R. B.
                  had achieved religious acclaim and was also widely respected
                  as a shrewd businessman. In business, he found a new frontier
                  to which he could direct his skill. It was in the sale of palm
                  kernels, popularly referred to as produce, that he found a new
                  challenge. The British in pursuit of raw commodities from the
                  hinterland had set up companies in Lagos and despatched
                  Britons to set up branches in the interior to facilitate the
                  purchase of these commodities. Notable among these companies
                  was the U.A.C. Mr. Jones representing U.A.C. as manager in
                  Ijebu-Ode sought a new elite force which could reliably
                  deliver to U.A.C. produce commodities over and beyond a
                  subsidy sum rendered by U.A.C. It was a mission that required
                  capital to make capital. Hadji R.B. entered into produce and
                  forged a relationship with U.A.C. and Mr. Jones the U.A.C.
                  Manager that transcended business. Hadji R.B. in his business
                  pursuit did not stop at doing business with U.A.C. of Nigeria,
                  he went as far as to buying shares from U.A.C. parent body in
                  U.K. When R.B. took up any business, he pursued it all the
                  way. Mr. Jones found in Hadji R.B. diligence and honesty which
                  resulted into confidence and goodwill, which in turn resulted
                  into profits. – for Hadji R.B. made a lot of money from
                  produce. The size and the success of his produce business is
                  evident from the two warehouses, abutting one another, which
                  he built at Folagbade Street in Ijebu-Ode. At the time of Giwa
                  Kila&apos;s death, he had eleven male children viz Amusa,
                  Muyibi, Tijani, Gaffari, Sule, Yinusa, Fasasi, Liadi, Ganiyu,
                  Muritala and Lamidi who came under the custody of Hadji R.B.
                  At that period, there was less emphasis on the educational
                  training of female children. Women were enrolled to a trade
                  and married to a selected male at maturity. A common custom at
                  that time was for widows in this case Giwa Kila&apos;s wives,
                  to be maintained by the brother of the deceased as well as to
                  raise progeny. This was a blend of culture and religion.
                  Religion, in the sense that a muslim male could take more than
                  one wife if he wished and if he had the means to maintain
                  them. Culture, in the sense that traditionally marriage is not
                  regarded dissolved by death. However, Hadji R.B. did not raise
                  any progeny with Giwa Kila&apos;s surviving widows. One of
                  Giwa Kila&apos;s widows was Sefi Mosuro, a woman of great
                  pride. In 1929 her father Ogunnaike was crowned Awujale of
                  Ijebu-Ode and she took excessive pride in being a princess.
                  After her father became King, she spent more time at the Apebi
                  palace than at Giwa Kila&apos;s. With the passing of Giwa Kila
                  and to meet her needs, her father gave her a piece of land at
                  Obalende where she built her own house. Sefi Mosuro had the
                  most surviving children for Giwa Kila — four males and two
                  Females. By the time her children were married, a fairly big
                  Mosuro family had built up strongly around her but quartered
                  at Obalende. Her grand children knew little about the larger
                  Mosuro family at Ita Ntebo. Likewise, many Hadji R.B.&apos;s
                  grand children little intermingled with Obalende or thought
                  them to be related to Ntebo. Such was the insulation and
                  attachment each branch had to its nuclear head, the result of
                  which an artificial and temporary gulf was created within the
                  family. Happily the gulf has been bridged. However, Hadji R.
                  B. has been criticised particularly by the female children of
                  Giwa Kila for not showing enough attention and affection for
                  their families after marriage. The criticism may have its own
                  justification. However, one needs to examine the size of Giwa
                  Kila&apos;s family that Hadji R. B. inherited and the size of
                  Hadji R.B.&apos;s family along with the volume of business and
                  other activities that he was engaged in to understand there
                  was a limit to the amount of individual attention he could
                  render to all. When Hadji R.B. entered into produce, he
                  acquired immense wealth. Now that the money was there he set
                  about his dream to build a family house. All the while he had
                  been resident at the family bungalow house at Ita Ntebo. The
                  ownership of the piece of land on which the bungalow was
                  situated had gone through hands. It had been transferred from
                  Egundebi to Adelaja, who in turn transferred it to Giwa Kila
                  and who finally gave it to Hadji R.B. Hadji R. B&apos;s plan
                  was to demolish the bungalow and erect a taller and more
                  modern building on it. But first he needed a place for his
                  family to stay while the house was under construction. Hadji
                  R. B. bought from the Laketu family a piece of land behind the
                  bungalow that was going to be demolished and erected a new
                  bungalow to house his family while the main building was under
                  construction. The new storey building was very detailed and
                  needed the best craftsmen for execution. Hadji R. B. knew
                  exactly what he wanted. A glorious two storey building with
                  designed accomodation for him, his children and his
                  children&apos;s family. The chief mason, Captain Karimu, was
                  invited from Lagos to handle the project. He was ably assisted
                  by Kasummu Eleshin Balogun and other local bricklayers.
                  Captain Karimu had earlier distinguished himself by the
                  quality brick house he built at Odegbo. Another major party to
                  the building project was Mr. Jones, the U.A.C. Manager. Hadji
                  R. B. had taste and had money to satisfy his desires. He had
                  travelled outside of Nigeria to Mecca and he knew what luxury
                  was about. With the assistance of the U.A.C. Manager, his
                  major finishing materials were imported from U.K. Pitch Pine
                  ceiling was imported from U.K. A leisure rolling chair which
                  enabled him to move on wheels around his floor came from U.K.
                  Gold plated bed designed with a crown over it came from U. K.
                  Furniture upholstered in red velvet came from U.K. And so on
                  and so forth. When Balogun Kuku opened his Olorunsogo house in
                  1902, some Alladin lamps were presented to him as gifts from
                  Egypt. The lamps were novelty at that time but they offered
                  limited illumination. Hadji R. B. had bigger ideas for his
                  house under construction. With Mr. Jones again, he imported
                  from U. K. a generating plant powered by battery with enough
                  power to illuminate the new two storey house, the bungalow
                  house he temporarily resided in and the community mosque that
                  abuts the house. When the building was completed in 1932 it
                  was the first &quot;skyscraper&quot; in the city. Spectators
                  came and sought opportunity to go to the top floor to observe
                  the whole city from a vantage point. It was the first house in
                  Ijebu province with electricity. Spectators trooped in at
                  night, mouth agape while they saw night turned to day by the
                  power of the generating plant. The community mosque abutting
                  the house multiplied its membership at evening prayers because
                  Hadji R. B. kindly extended electricity from his generating
                  set to the mosque. For those that were close enough or had any
                  business with Hadji R. B. every effort was made to see and sit
                  in the palatial sitting room. The slogan was, sit on the red
                  velvet sofa and be happy. For the children of Hadji R. B.,
                  they walked the city shoulder high. Their father&apos;s
                  achievement gave them excessive pride. By extension, the
                  achievement was also theirs. When Hadji R. B. went fully into
                  produce he put his son Mumuni Foluso (M.F.) in charge of the
                  22 Ita Netbo retail shop. He was not the first child, Abibatt,
                  was but she was a girl. M.F. was the first son and thus the
                  sire. Being the heir to the family fortunes, he had an aura of
                  power about him while his younger brothers and sisters looked
                  up to him. His life plan was well designed. He was first to
                  establish himself in business and thus ensure the
                  establishment of his younger ones. That was business. He was
                  also to mould the family ethos and thus make them act as one
                  unit. While M.F. ran the retail shop, Hadji R.B. ran the
                  bigger produce warehouses. In the course of this, Hadji R. B.
                  also ventured into a new business. It was timber business.
                  Giva Kila had passed on to Hadji R. B. his hammer permit I. J.
                  No. 1. This was the first government permit assigned any one
                  in Ijebu-Ode to fell trees. Hadji R. B. brought his business
                  acumen to play in this new timber business. As the trees came
                  crashing down in the virgin forest, they turned to profit and
                  Hadji R. B. enhanced his wealth. When the timber business was
                  firmly entrenched, M.F. was seconded from the retail shop to
                  head the timber business. The timber business on the field was
                  a risky and gruelling business. One of M.F.&apos;s brothers
                  who had a go at it vowed never to return to it. Other brothers
                  dodged it from tales of morbidity and mortality arising from
                  tree felling and transportation. Perhaps M. F. did not like
                  the rough and risky activities of timber business. We will
                  never know. He however forged on at it gaining determination
                  from the pressures that underlay the prerogatives of being the
                  heir to the family fortunes. While the timber business
                  progressed, Hadji R. B. found yet another challenge to direct
                  his energy. Up until 1930 there were no Muslim schools in
                  Ijebu-Ode that offered western education. Although there were
                  more mosques across the city than churches, the Muslims lagged
                  behind in the drive towards western education, offering
                  instead Arabic and Islamic education at the numerous Ile Kewu.
                  The Christians on the other hand had mission schools that
                  offered western education. The result was that many Muslim
                  children attended Christian mission schools, got converted
                  into Christianity in the process, much to the chagrin of the
                  Muslim parents. Mr. B. Daramola of the Education office
                  advised Hadji R. B. to pool together the other Muslim notables
                  in the city with the aim of, among other things, setting up in
                  Ijebu-Ode a Muslim school. On the strength of this advice,
                  Hadji R. B. along with A. G. Mebude, A. O. Ashiru, Hadji M. O.
                  Abasas Odunsi and others formed a committee and started the
                  first Muslim primary school at the Central Mosque Oyingbo in
                  January 30, 1930. It was called Muslim school and the first
                  headmaster was D. O. Eweoso. To the committee that was largely
                  responsible for the founding of the Muslim school, Hadji R. B.
                  was made the treasurer. The reasons were obvious. He had
                  demonstrated through the success of his businesses the
                  management of money. He was held in trust as an honest man and
                  one who the lure of collective collection could not seduce.
                  Hadji R. B. managed the finance and signed the cheques. There
                  is some intrigue about Hadji R. B. signing cheques. He was
                  thoroughly versed in Arabic but not learned in western
                  education to read or write in English or Yoruba. But in the
                  produce business he had two clerks:- Messrs Aderibigbe and
                  Ayanbadejo, graduates of Western primary and semi-secondary
                  education under him. They kept the written record and the
                  written communication. They had another assignment. During
                  slack periods of the business, Hadji R. B. made them teach him
                  during office hours to read and write in Yoruba and to sign
                  his name. It had an impact on him. Before the commencement of
                  the Muslim school, western education was compulsory for his
                  children particularly the males. Now with the Muslim school,
                  education was doubly compulsory for the growing children.
                  Being able to sign his cheque he became the custodian of his
                  own money. The Moslem primary school moved to its permanent
                  site at Isoku in 1936 after the Central mosque Oyingbo became
                  dilapidated in 1934. It was co-educational but in 1943 another
                  school <i>Moslem Girls Impe</i> was started to make a second
                  muslim primary school in Ijebu-Ode. On and on the list grew.
                  It followed that once there were muslim primary schools, a
                  thought would be given to founding a muslim secondary school
                  which was the next stage of education. The arrangement for
                  setting up a secondary school began in 1946 and spear heading
                  it were the nuclear group who founded the first muslim primary
                  schools, but the success of it arose as a result of the
                  collective contribution of the Muslim community of Ijebu-Ode.
                  Donations in cash were collected. Slaughtered ram hides during
                  the Idul Kabir (Ileya festival) were collected across the city
                  and sold to raise money towards the setting up of a secondary
                  school. Hadji R. B. was at the centre of it all and when the
                  school, Ijebu Muslim College was founded in 1950 Hadji R. B.
                  Mosuro and a few other prominent founding fathers were
                  honoured by the school. School houses were named after them.
                  Ten years later, a sister Muslim secondary school was founded
                  exclusively for girls – <i>Muslim Girls High School</i>. By
                  founding primary and secondary schools, the Ijebu muslim
                  community had done its best and reached its limit. For higher
                  education and other professional trainings it was mostly to
                  the U.K... that people turned. Hadji R. B. had to draw from
                  his reservoir for an overseas scheme that would benefit his
                  children. Fortunately, one of his children Moshudi Abolaji
                  (M.A.) undergoing higher training in U.K. had mooted the idea
                  of buying a house in U. K. for his own use and sought
                  financial support from Hadji R. B. It was a proposition Hadji
                  R. B. supported but further carved into a loftier
                  accomplishment. He augmented M.A&apos;s funds towards the
                  purchase of the house and much later fully bought the house
                  off him. The house situated on 26, Sumatra Road, London became
                  Mosuro house in U. K. Hadji R. B. reasoned that if U. K. was
                  the seat of higher education for students, then his children.
                  and children&apos;s children would ever have a place to stay
                  while studying in the U.K. Regrettably, the Mosuro U. K. house
                  was sold in 1982 amidst controversy after it fell into
                  disrepair The Idul-Kabir popularly referred to as Ileya
                  festival because it was a time of home coming among the
                  faithfuls and unfaithfuls, featured elaborate and great
                  felicities. It was a family re-union to the Mosuros, much as
                  it was for many other families. It was also a carnival that
                  took three days. Once a man or family had earned the
                  city&apos;s respect and prominence, he could opt to ride on a
                  horse to the praying grounds if he had the means. Hadji R.B.
                  had both the means and prominence to ride to the praying
                  grounds and ride to pay homage to the Awujale at Ojude Oba and
                  the city two days later. Hadji R.B. was an extraordinary sight
                  to behold on the horse. His horse would be adorned in rich
                  bright ornaments indicative of the splendour of the occasion
                  and the wealth of the rider. Along with horse riding were
                  several drummers to supply music. The drums would have been
                  tanned and conditioned for two days while the drummers rested
                  and devoured meal after meal. The event at Ojude Oba was a day
                  of continuous activity and it was not going to be an easy
                  task. On the day of festivities, the drummers would beat and
                  beat, beam and beam, sing and sing until their voices went
                  hoarse, dance and dance wild, make the music and joyously
                  dance to it. They too were a scene unto themselves. Flags
                  festooned the whole area and children struggled with one
                  another for flags hoisted on light sticks that would be
                  carried ahead of the rider. Men with bullet filled bandoliers
                  slung over their shoulders intermingled with the supporters.
                  They carried long and short guns. Every now and then without
                  prior warning they would shoot into the air. The loud bang
                  would momentarily deafen the ears of all the people around,
                  the children froze, the women shrieked and the horses jerked.
                  Once the horse reacted nervously to the first gun shots, Hadji
                  R.B&apos;s horse from then on galloped elegantly to the
                  thunderous music. For the Ileya festival as many as twenty
                  rams lined up in Hadji R.B&apos;s 22 Ntebo house to be
                  slaughtered, Very often the sizes of the rams conformed to the
                  family hierarchy. Hadji R. B&apos;s ram was the biggest. M.
                  F&apos;s was next in size and later Abibat Shote&apos;s came
                  neck in neck with M.F&apos;s. And so on down the line. And
                  when the rams were slaughtered, seniority had to be conformed
                  to again. It was Hadji R.B&apos;s first and then the
                  children&apos;s and the wives. Everything was by order.
                  Garuba, a paid semi-butcher inflated and dissected the leading
                  ram before all others. For the grandchildren it was a
                  carnival. The Ileya festival was desirable. They were dressed
                  in their finest clothing and they ate to satiety. The parents
                  on the other hand converged around M. F. who was now called
                  Baba Eko. They ate frequently together and discussed family
                  matters with the heir apparent. Among the grandchildren in his
                  sphere were immediately corrected and everybody straightened
                  up. It was not that he was a terror. He was the prince to the
                  family throne and he had that grace characteristic of powerful
                  people about him. On Tuesday July 12, 1966, Baba Eko woke up
                  with a discomfort. He had shortness of breath. His medical
                  record had been clean although his blood pressure elevated
                  once in a while. This was adequately managed by Dr. Ogunmekan,
                  consultant internist at Ijebu-Ode General hospital. On this
                  day Dr. Ogunmekan was called in the morning to see Baba Eko.
                  He checked his blood pressure, checked his pulse and checked
                  him all over. If the doctor had any anxiety over his patient,
                  it was professionally concealed. He prescribed some
                  medications and offered to come back at 1 p.m. to examine his
                  patient again. Before Dr. Ogunmekan returned at 1 p.m., Baba
                  Eko had died. All the while Baba Eko received treatment and
                  eventually died, Hadji R. B. uninformed and unaware, was
                  upstairs in his quarters. Hadji &quot;Tobe&quot; Abdul-Quadri
                  Bakare, a friend of Baba Eko, had noticed he was absent from
                  the mosque for the early morning prayer and also for the
                  afternoon prayer. It was unusual for Baba Eko to miss his
                  prayers as long as he was in town. Hadji Bakare therefore
                  decided to call at Baba Eko&apos;s to inquire about him. He
                  found him dead and broke out loud the otherwise concealed
                  transition. Hadji R. B. through the pandemonium got to know of
                  his son&apos;s death. The heir had died before the King.
                  Calamity had struck. Hadji R. B. maintained a manly visage
                  over the loss of Baba Eko but life could never be the same
                  again for him. It began the closing years of his life. Hadji
                  R. B. invested in all the children under him but it was Baba
                  Eko he groomed the most, planting him on every business he
                  touched. All the while there was no second fiddle as long as
                  Baba Eko was heir. Now Baba Eko was gone and Hadji R. B. was
                  aged. It was a harbinger of the leadership vacuity that would
                  initially follow the king&apos;s death. In summary, Hadji R.
                  B. had taken religion and achieved. It was in recognition of
                  his religious record that he was made the President of the
                  Alhajis and Alhajas (Egbe Zumratuluyad) in Ijebu province in
                  the early 1960s. In commerce, he succeeded in many frontiers
                  and demonstrably enjoyed his labours. In education, his name
                  had been immortalised for the significant role he played. For
                  many years he served as President of the Ijebu National
                  society – a progressive body comprising all Ijebu communities
                  and dedicated to the progress and unity of Ijebus. And at the
                  height of it all, Hadji R.B. was also a kingmaker. By blood,
                  the Mosuros belong to the Olutoyese ruling house in Ijebu-Ode.
                  It was Hadji R. B. on behalf of the Olutoyese ruling house who
                  presented the popular choice of the ruling house, the present
                  Awujale of Ijebuland Oba Sikiru Adetona to the regents and the
                  general public at Itoro Town Hall in 1960 as candidate from
                  our ruling house for the vacant stool in Ijebu-Ode. Hadji R.
                  B. wielded tremendous power in the community. The power that
                  he wielded was not solely the power that sprang from money. He
                  had been involved in a network of communal activities and had
                  displayed a very incisive grasp of problems and expended his
                  energy and personal finance towards their solutions. He was
                  without peer in his commitment to education. He desired
                  primary and secondary education for all muslims in Ijebu and
                  worked selflessly towards it. In the words of an educationist
                  who worked under him for eight years &quot;Hadji R. B. was a
                  great man who had the interest of the people at heart. He
                  cherished good things for other people even more than
                  himself&quot;. Because of his person and achievements Hadji
                  R.B. stood tall in the city and the community deferred to him.
                  His 22 Ita-Ntebo house was always a bee hive of activities.
                  Individuals and groups regularly took turns to meet with him,
                  to acquaint him with problems and seek his counsel. He was
                  like a communal sage. In his golden years, Hadji R. B. would
                  be driven in his car every morning to the schools he
                  participated so much to start. A drive round the city and a
                  return to the tranquility of his home. In his youth and in his
                  working years he had worked diligently and made a fortune, now
                  all that was left was to collect returns from his investments
                  both in Lagos and in Ijebu-Ode. To his children, particularly
                  the males he gave them in his twilight parcels of land in
                  consideration of natural love and affection and admonished
                  them on life after him. To the Central mosque and Ita Ntebo
                  mosque he donated generously. Over the years the Friday
                  donations were a ritual. It began with the beggars. They came
                  on Friday morning with palms up and begging tunes enough to
                  hold the attention of a symphony audience. Hadji R.B. was
                  always ever ready to receive them. From their begging tunes he
                  knew they were around. In anticipation, Hadji R.B. would have
                  brought out money in a jute bag from the 30” x 29” x 21” steel
                  security safe in his bedroom. He would then look down from his
                  first floor and the shiny newly minted coins would rain from
                  his right hand. Very soon he could no longer look down because
                  there was nothing to see. Age had taken its toll and the eye
                  had become cloudy. It was a condition called cataract and it
                  was inevitably part of the ageing process. Next the legs
                  buckled for they could no longer support the body and Hadji
                  R.B. remained bed ridden. On Wednesday the 5th of January
                  1972, Hadji R. B. at the age of 87 died. When the news of his
                  passing circulated, mourners thronged to 22 Ita Ntebo to pay
                  their last respect. The family he left behind by itself was a
                  crowd. The city mourners were a bigger crowd. Both fused to
                  form a mammoth crowd while his body was borne aloft to the
                  cemetery. Hadji R.B&apos;s life crossed successfully many
                  different activities, but the most fitting tribute to his life
                  is the epitaph aptly inscribed on his tombstone. It simply
                  reads: &quot;Hadji Rufai Banjoko Mosuro — a father indeed.”{" "}
                  <br />
                  It was the end of an era.
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
