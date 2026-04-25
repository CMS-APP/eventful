import Collapsible from "react-native-collapsible";

import { useCallback, useState } from "react";

import { StyleSheet, View } from "react-native";

import { LoadingModal } from "@/components/views/LoadingModal";

import { DataActionButtons } from "./DataActionButtons";
import { DeleteAccountButton } from "./DeleteAccountButton";
import { DropdownButton } from "./DropdownButton";

export function DataSettings() {
  const [dataOpen, setDataOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const toggleData = useCallback(() => setDataOpen(!dataOpen), [dataOpen]);

  return (
    <View style={styles.container}>
      <LoadingModal visible={loading} />

      <DropdownButton
        isDropdownClosed={!dataOpen}
        toggleDropdown={toggleData}
        title="Data Settings"
      />

      <Collapsible collapsed={!dataOpen}>
        <View style={styles.buttonColumn}>
          <DataActionButtons setLoading={setLoading} />
          <DeleteAccountButton setLoading={setLoading} />
        </View>
      </Collapsible>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonColumn: {
    gap: 12,
    marginBottom: 6,
    marginTop: 6
  },
  container: {
    gap: 6,
    marginTop: 6
  }
});
