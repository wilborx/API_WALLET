"use client";
import { useState } from "react";
import { useMutation } from "@apollo/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UPDATE_API_KEY } from "@/lib/graphql/queries";

interface EditKeyModalProps {
  apiKey: {
    id: string;
    name: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export function EditKeyModal({ apiKey, isOpen, onClose }: EditKeyModalProps) {
  const [name, setName] = useState(apiKey.name);
  const [updateApiKey, { loading, error }] = useMutation(UPDATE_API_KEY, {
    onCompleted: () => {
      toast.success("Changes saved successfully!");
      onClose();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateApiKey({ variables: { id: apiKey.id, name } });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit API Key</DialogTitle>
          <DialogDescription>
            Change the name of your API key here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
        {error && <p className="text-red-500 text-sm mt-2">{error.message}</p>}
      </DialogContent>
    </Dialog>
  );
}
