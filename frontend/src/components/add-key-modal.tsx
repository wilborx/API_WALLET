"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { providers } from "@/config/providers";
import { GET_API_KEYS, ADD_API_KEY } from "@/lib/graphql/queries";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CheckCircle, Copy } from "lucide-react";

interface CreatedKey {
  id: string;
  name: string;
  provider: string;
  maskedKey: string;
  status: string;
  createdAt: string;
  fullKey: string;
}

export function AddKeyModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [provider, setProvider] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [createdKey, setCreatedKey] = useState<CreatedKey | null>(null);

  const [addApiKey, { loading }] = useMutation(ADD_API_KEY, {
    refetchQueries: [{ query: GET_API_KEYS }],
    onCompleted: (data) => {
      setCreatedKey(data.addApiKey);
      setStep(3);
      toast.success("API key added successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addApiKey({ variables: { name, provider, apiKey } });
  };

  const handleClose = () => {
    // Reset form fields when closing the modal
    setName("");
    setProvider("");
    setApiKey("");
    setCreatedKey(null);
    setStep(1);
    setOpen(false);
  };

  const copyToClipboard = () => {
    if (createdKey?.fullKey) {
      navigator.clipboard.writeText(createdKey.fullKey);
      toast.success("Copied to clipboard!");
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      handleClose();
    }
    setOpen(isOpen);
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <DialogHeader>
              <DialogTitle>Choose a Provider</DialogTitle>
              <DialogDescription>
                Select the provider for which you want to add an API key.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              {providers.map((p) => (
                <motion.div
                  key={p.id}
                  whileHover={{ y: -5 }}
                  className={cn(
                    "rounded-lg border p-4 flex flex-col items-center justify-center cursor-pointer transition-colors",
                    provider === p.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card/30 hover:bg-muted/50"
                  )}
                  onClick={() => setProvider(p.id)}
                >
                  <p.logo className="h-10 w-10 mb-2" />
                  <span className="font-semibold">{p.name}</span>
                </motion.div>
              ))}
            </div>
            <Button
              onClick={() => setStep(2)}
              disabled={!provider}
              className="w-full"
            >
              Next
            </Button>
          </>
        );
      case 2:
        const selectedProvider = providers.find((p) => p.id === provider);
        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedProvider && <selectedProvider.logo className="h-6 w-6" />}
                Add {selectedProvider?.name} API Key
              </DialogTitle>
              <DialogDescription>
                Enter a name and your API key to continue.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <Input
                placeholder="Key Name (e.g. 'Project X')"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-transparent"
              />
              <Input
                type="password"
                placeholder="Paste your API key here"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
                className="bg-transparent"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="w-full"
                >
                  Back
                </Button>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Saving..." : "Save Key"}
                </Button>
              </div>
            </form>
          </>
        );
      case 3:
        return (
          <>
            <DialogHeader className="items-center text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <DialogTitle>API Key Created</DialogTitle>
              <DialogDescription>
                This is the only time you will see the full API key. Please store it securely.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-3 bg-muted rounded font-mono text-sm break-all relative pr-10">
                {createdKey?.fullKey}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1/2 right-1 -translate-y-1/2 h-8 w-8"
                  onClick={copyToClipboard}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            </div>
          </>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>Add New Key</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card/50 backdrop-blur-lg border-white/10">
        {renderStepContent()}
      </DialogContent>
    </Dialog>
  );
}
