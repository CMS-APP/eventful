import { StyleSheet, View } from "react-native";

import { Input } from "@/design-system/components/Input";
import { TextButton } from "@/design-system/components/TextButton";
import { colors } from "@/design-system/tokens/colors";
import {
  AddressField,
  AddressFieldKey,
  AddressValues
} from "@/services/address/addressFormat";

interface AddressFieldsFormProps {
  fields: AddressField[];
  values: AddressValues;
  countryName: string;
  onFieldChange: (key: AddressFieldKey, text: string) => void;
  onCountryNameChange: (text: string) => void;
  onClear: () => void;
}

export function AddressFieldsForm({
  fields,
  values,
  countryName,
  onFieldChange,
  onCountryNameChange,
  onClear
}: AddressFieldsFormProps) {
  return (
    <View style={styles.addressFields}>
      {fields.map((field) => (
        <Input
          key={field.key}
          placeholder={field.label}
          value={values[field.key] ?? ""}
          onChangeText={(text) => onFieldChange(field.key, text)}
          dark
          backgroundColor={colors.primaryTint3}
          textColor={colors.white}
        />
      ))}

      <Input
        placeholder="Country"
        value={countryName}
        onChangeText={onCountryNameChange}
        dark
        backgroundColor={colors.primaryTint3}
        textColor={colors.white}
      />

      <View style={styles.clearAddressButton}>
        <TextButton
          text="Clear Address"
          textColor={colors.white}
          textAlign="center"
          type="body"
          onPress={() => onClear()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  addressFields: {
    gap: 6
  },
  clearAddressButton: {
    alignSelf: "center"
  }
});
