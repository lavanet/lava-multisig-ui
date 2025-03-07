import { useChains } from "@/context/ChainsContext";
import { setNewConnection } from "@/context/ChainsContext/helpers";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "../ui/dialog";
import { Tabs, TabsContent, TabsList } from "../ui/tabs";
import ChooseChain from "./ChooseChain";
import ConfirmConnection from "./ConfirmConnection";
import CustomChainForm from "./CustomChainForm";
import DialogButton from "./DialogButton";
import TabButton from "./TabButton";

const tabs = { choose: "choose", custom: "custom" };

export default function ChainConnect() {
  const { newConnection, chainsDispatch } = useChains();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(open) => {
        setDialogOpen(open);
        setNewConnection(chainsDispatch, { action: "edit" });
      }}
    >
      <DialogButton />
      <DialogContent
        className={"max-h-[75%] max-w-[75%] overflow-y-auto bg-orange-600"}
        style={newConnection.action === "confirm" ? { width: "auto" } : {}}
      >
        {newConnection.action === "confirm" ? (
          <ConfirmConnection closeDialog={() => setDialogOpen(false)} />
        ) : (
          <Tabs defaultValue={newConnection.chain ? tabs.custom : tabs.choose}>
            <DialogHeader>
              <TabsList className="justify-start gap-2 bg-transparent">
                <TabButton value={tabs.choose}>Choose chain</TabButton>
                <TabButton value={tabs.custom}>Custom chain</TabButton>
              </TabsList>
            </DialogHeader>
            <TabsContent value={tabs.choose}>
              <ChooseChain />
            </TabsContent>
            <TabsContent value={tabs.custom}>
              <CustomChainForm />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
