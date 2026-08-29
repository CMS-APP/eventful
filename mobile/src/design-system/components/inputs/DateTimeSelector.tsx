import DateTimePicker from "@react-native-community/datetimepicker";

import { useCallback, useState } from "react";

import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";

import { Button } from "@/design-system/components/buttons/Button";
import { ModalView } from "@/design-system/components/overlays/ModalView";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";

interface DateTimeSelectorProps {
  date: Date;
  setDate: (date: Date) => void;
  showPicker: boolean;
  setShowPicker: (show: boolean) => void;
  mode?: "date" | "time";
}

export function DateTimeSelector({
  date,
  setDate,
  showPicker,
  setShowPicker,
  mode = "date"
}: DateTimeSelectorProps) {
  const [show, setShow] = useState(true);

  function onChangeValue(selectedDate: Date) {
    setDate(selectedDate);
  }

  const getDisplayValue = useCallback(() => {
    if (mode === "date") {
      return date.toLocaleDateString();
    }
    return date.toLocaleTimeString();
  }, [date, mode]);

  const getTitle = useCallback(() => {
    return mode === "date" ? "Date Picker" : "Time Picker";
  }, [mode]);

  return (
    <ModalView
      show={showPicker}
      setShow={setShowPicker}
      backgroundColor={colors.primary}
      borderColor={colors.lightGray + "40"}
    >
      <Text type="header" color="white">
        {getTitle()}
      </Text>
      {Platform.OS === "android" && (
        <TouchableOpacity
          style={styles.displayButton}
          onPress={() => {
            setShow(true);
          }}
          hitSlop={getHitSlop("medium")}
        >
          <Text style={styles.displayText}>{getDisplayValue()}</Text>
        </TouchableOpacity>
      )}

      <View style={styles.pickerContainer}>
        {(show || Platform.OS === "ios") && (
          <DateTimePicker
            themeVariant={"dark"}
            value={date}
            mode={mode}
            display={mode === "date" ? "inline" : "spinner"}
            minuteInterval={1}
            accentColor={colors.secondary}
            onChange={(event, value) => {
              if (Platform.OS === "android") {
                setShow(false);
              }
              onChangeValue(value as Date);
            }}
          />
        )}
      </View>

      <Button
        text="Save"
        textColor={colors.white}
        color={colors.primaryTint}
        onPress={() => setShowPicker(false)}
        leadingIcon="check"
      />
    </ModalView>
  );
}

const styles = StyleSheet.create({
  displayButton: {
    backgroundColor: colors.primary,
    marginBottom: 16,
    marginTop: 12
  },
  displayText: {
    color: colors.white,
    fontSize: 12,
    letterSpacing: Platform.OS === "android" ? 1.5 : 2,
    textAlign: "center"
  },
  pickerContainer: {
    alignItems: "center"
  }
});
