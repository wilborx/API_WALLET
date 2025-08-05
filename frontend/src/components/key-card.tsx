"use client";
import { motion } from "framer-motion";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { MoreHorizontal, KeyRound, Loader2 } from "lucide-react";
import { providers } from "@/config/providers";
import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { toast } from "sonner";
import { DELETE_API_KEY, GET_API_KEYS } from "@/lib/graphql/queries";
import { EditKeyModal } from "./edit-key-modal";
import { ConfirmDeleteDialog } from "./confirm-delete-dialog";

interface ApiKey {
  id: string;
  name: string;
  provider: string;
  maskedKey: string;
  status: string;
  createdAt: string;
}

export function KeyCard({ apiKey }: { apiKey: ApiKey }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteApiKey] = useMutation(DELETE_API_KEY, {
    refetchQueries: [{ query: GET_API_KEYS }, "GetApiKeys"],
    onCompleted: () => {
      toast.error("API key deleted.");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDelete = async () => {
    await deleteApiKey({ variables: { id: apiKey.id } });
    setIsDeleteDialogOpen(false);
  };

  const getProviderIcon = () => {
    const provider = providers.find((p) => p.id === apiKey.provider.toLowerCase());
    const Icon = provider?.logo || KeyRound;
    return <Icon className="h-8 w-8 text-muted-foreground" />;
  };

  const getStatusIndicator = () => {
    switch (apiKey.status) {
      case "active":
        return <Badge variant="default">Active</Badge>;
      case "invalid":
        return <Badge variant="destructive">Invalid</Badge>;
      case "verifying":
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Verifying
          </Badge>
        );
      default:
        return <Badge variant="secondary">{apiKey.status}</Badge>;
    }
  };

  return (
    <>
      <EditKeyModal
        apiKey={apiKey}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
      />
      <motion.div
        whileHover={{ y: -5 }}
        className="rounded-lg border border-border bg-card/30 p-4 flex items-center justify-between"
      >
      <div className="flex items-center gap-4">
        {getProviderIcon()}
        <div>
          <p className="font-semibold">{apiKey.name}</p>
          <p className="text-sm text-muted-foreground font-mono">{apiKey.maskedKey}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {getStatusIndicator()}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-haspopup="true" size="icon" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>Rotate Key</DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-500"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
    </>
  );
}
