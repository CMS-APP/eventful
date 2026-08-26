import { useSelector } from "react-redux";

import { StyleSheet, View } from "react-native";

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { colors } from "@/design-system/tokens/colors";
import { useAppDimensions } from "@/design-system/tokens/globalStyles";
import {
  AppStackParamList,
  EventsStackParamList,
  MainStackParamList
} from "@/features/app/navigationTypes";
import { UserState } from "@/store/UserSlice";

import { HomeNotificationButtons } from "./HomeNotificationButtons";
import { HomePageButton } from "./HomePageButton";

interface HomeButtonsProps {
  scrollY: number;
}

export function HomeButtons({ scrollY }: HomeButtonsProps) {
  const premium = useSelector((state: UserState) => state.premium);
  const photoBooth = useSelector((state: UserState) => state.photoBooth);
  const buttonHeight = useAppDimensions().screenHeight > 1000 ? 200 : null;
  type EventsNestedRouteParams =
    | {
        [K in keyof EventsStackParamList]: {
          screen: K;
          params: EventsStackParamList[K];
        };
      }[keyof EventsStackParamList]
    | undefined;
  type HomeButtonsNavigationParamList = AppStackParamList &
    Omit<MainStackParamList, "Events"> & {
      Events: EventsNestedRouteParams;
    };
  const navigation =
    useNavigation<StackNavigationProp<HomeButtonsNavigationParamList>>();

  function newEventAction() {
    navigation.navigate("Events", {
      screen: "EventsList",
      params: { newEvent: true }
    });
  }

  function onPhotoBoothPress() {
    if (photoBooth || premium) {
      navigation.navigate("PhotoBooth");
    } else {
      navigation.navigate("Paywall", { type: "photoBooth" });
    }
  }

  function onInspirationPress() {
    navigation.navigate("Inspiration");
  }

  function onCalendarPress() {
    navigation.navigate("Calendar");
  }

  return (
    <View>
      <View style={styles.buttonsContainer}>
        <View style={styles.buttonsRow}>
          <View style={styles.leftColumn}>
            <View style={styles.row}>
              <HomePageButton
                icon="book"
                text={"New Event"}
                color={colors.primaryTint}
                textColor={colors.white}
                buttonAction={() => {
                  newEventAction();
                }}
                style={{ height: buttonHeight }}
              />

              <HomePageButton
                icon="lightbulb"
                text={"Inspiration"}
                color={colors.gray}
                textColor={colors.white}
                buttonAction={onInspirationPress}
                style={{ height: buttonHeight }}
              />
            </View>

            <View style={styles.row}>
              <HomePageButton
                icon="camera"
                text={"Photo Booth"}
                color={
                  premium || photoBooth ? colors.secondary : colors.lightGray
                }
                textColor={premium || photoBooth ? colors.white : colors.black}
                buttonAction={onPhotoBoothPress}
                style={{ height: buttonHeight }}
              />

              <HomePageButton
                icon="calendar"
                text={"Calendar"}
                color={colors.primaryTint2}
                textColor={colors.white}
                buttonAction={onCalendarPress}
                style={{ height: buttonHeight }}
              />
            </View>
          </View>

          <HomeNotificationButtons />
        </View>
      </View>

      <View
        style={[
          styles.animatedBackground,
          {
            top: -scrollY - 140,
            height: scrollY + 100
          }
        ]}
      />

      <View
        style={[
          styles.animatedAccent,
          {
            top: -scrollY - 180,
            height: scrollY + 150
          }
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  animatedAccent: {
    backgroundColor: colors.primaryTint,
    bottom: 0,
    position: "absolute",
    right: 40,
    width: 10
  },
  animatedBackground: {
    backgroundColor: colors.white,
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    width: "100%"
  },
  buttonsContainer: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    flex: 1,
    paddingBottom: 50,
    paddingHorizontal: 24
  },
  buttonsRow: {
    alignItems: "stretch",
    flexDirection: "row",
    gap: 16,
    paddingRight: 76
  },
  leftColumn: {
    flex: 1,
    gap: 16
  },
  row: {
    alignItems: "stretch",
    flexDirection: "row",
    gap: 16
  }
});
