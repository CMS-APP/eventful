import Collapsible from "react-native-collapsible";

import { useCallback, useState } from "react";

import { StyleSheet, View } from "react-native";

import { DataActionButtons } from "./DataActionButtons";
import { DeleteAccountButton } from "./DeleteAccountButton";
import { DropdownButton } from "./DropdownButton";

export function DataSettings() {
  const [dataOpen, setDataOpen] = useState(false);
  const toggleData = useCallback(() => setDataOpen(!dataOpen), [dataOpen]);

  return (
    <View style={styles.container}>
      <DropdownButton
        isDropdownClosed={!dataOpen}
        toggleDropdown={toggleData}
        title="Data Settings"
      />

      <Collapsible collapsed={!dataOpen}>
        <View style={styles.buttonColumn}>
          <DataActionButtons />
          <DeleteAccountButton />
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
