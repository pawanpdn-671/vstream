import React from "react";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../shared/dialog";
import { Button } from "../shared/button";

const DeleteConfirmationModal = ({ title, description, onConfirm, buttonText, open, setOpen }) => {
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				<div className="pb-4 pt-2">
					<p className="text-base">{description}</p>
				</div>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Cancel</Button>
					</DialogClose>
					<Button onClick={onConfirm}>{buttonText}</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default DeleteConfirmationModal;
