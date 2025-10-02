"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="sm:max-w-[700px] max-h-[85vh]"
        hideClose={false}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Welcome to the Mosuro Family Website
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            A Message from the Family
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[55vh] overflow-y-auto pr-4">
          <div className="space-y-4 text-sm leading-relaxed">
            <p>
              When in the mid-1980s Mr Kolade Mosuro, ably assisted by Mr
              Ayodeji Mosuro, set out to document the history of the Mosuro
              family, little was known about the journey of the progenitors of
              the family. Their groundbreaking work culminated in the
              publication of the Mosuro Book, the first of its kind anywhere in
              recent times. The book shed light on the meaning of the Mosuro
              name and its derivation. One other key feature of the book was the
              family tree, plotting the lineage of family members from the first
              Mosuro till the date of publication of the book. The family tree
              was a remarkable feat in two ways. One, it traced the lineage of
              each family member and, two, it showed the relationship each
              member had with other members of the family. The book was
              published in 1987 and unveiled at the first Mosuro Day
              celebration.
            </p>

            <p>
              In the 40 years since the book&apos;s publication, the family has
              grown, and the need has evolved to complete some aspects of the
              history as well as update the family tree. The desire and will
              have always been there, however, the personnel to manage the
              project has had difficulty in synchronising their time schedules.
              And then Mr Tosin Mosuro, Mr Gbadegeshin Mosuro, Mr Fela Mosuro
              and I stepped to the plate and committed to updating the book and
              family tree. I must commend the efforts of Mr Tosin Mosuro in
              rounding up the members and setting up all the meetings of the
              &apos;committee&apos;. At one of its earliest meetings, the
              committee decided to develop a family website which would
              incorporate the contents of the original book, the family history,
              family tree, and a family directory. The advantages of having a
              website are numerous. It is modern and it offers the opportunity
              to perpetually update any information about the family tree,
              particularly when we consider the fact that some members of the
              family are widely spread in the diaspora.
            </p>

            <p>
              Mr Tosin Mosuro was actively involved in defining the scope and
              deliverables of the project. He was also instrumental in finding
              the developers of the website, &quot;The House of Sounds&quot; and
              acting as liaison. I must acknowledge the extraordinary work of
              the CEO of the company, Mr Subomi Mosuro and his team. They went
              the extra mile to ensure that the project was successfully
              delivered, overcoming all the technical challenges they faced
              during the process. With the completion of the website, the hope
              is that every member of the family will be granted access to their
              history and be able to understand their relationship with other
              members of the family.
            </p>

            <p>
              Another Mosuro Day celebration is in the works. This has been
              scheduled to hold on Saturday, May 24th, 2026, at the Adeola
              Odutola Hall in Ijebu Ode. We are looking forward to celebrating
              the true meaning of family. We honour the foresight and labour of
              Mr Kolade Mosuro and Mr Ayodeji Mosuro in laying the foundation.
              We are standing on the shoulders of these great men, along with
              our many forbearers who have built a solid reputation for the
              family. We hold the firm hope that we also may inspire the next
              generation to understand and appreciate that they do come from a
              great family.
            </p>

            <div className="pt-4 space-y-2">
              <p className="font-semibold">Dr &apos;Kunle Mosuro</p>
              <p className="text-sm text-muted-foreground">on behalf of</p>
              <div className="space-y-1">
                <p>Mr Tosin Mosuro</p>
                <p>Mr Fela Mosuro</p>
                <p>Mr Gbadegeshin Mosuro</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button onClick={onClose} className="w-full sm:w-auto">
            Continue to Website
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;
