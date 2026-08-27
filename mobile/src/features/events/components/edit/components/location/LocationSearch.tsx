import { getAuth } from "@react-native-firebase/auth";
import { ActivityIndicator } from "react-native-paper";

import { useEffect, useRef, useState } from "react";

import {
  Keyboard,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { Divider } from "@/design-system/components/Divider";
import { Input } from "@/design-system/components/Input";
import { Text } from "@/design-system/components/Text";
import { TextButton } from "@/design-system/components/TextButton";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { ContactsSearch } from "@/features/contacts/components/ContactsSearch";
import { getCountryByCode } from "@/features/events/countries";
import {
  AddressField,
  AddressFieldKey,
  AddressValues,
  createEmptyAddressValues,
  getAddressFieldsForCountry
} from "@/services/address/addressFormat";
import {
  extractRawPlaceAddress,
  mapRawPlaceAddressToFields
} from "@/services/address/placeAddressMapping";
import {
  PlaceSuggestion,
  getPlaceDetails,
  searchPlaces
} from "@/services/firebase/firebaseBackend";
import { showErrorToast } from "@/utils/toast";
import { generateUUID } from "@/utils/uuid";

const SEARCH_DEBOUNCE_MS = 500;

export function LocationSearch() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [addressFields, setAddressFields] = useState<AddressField[]>([]);
  const [addressValues, setAddressValues] = useState<AddressValues>({});
  const [countryName, setCountryName] = useState("");
  const [manualAddress, setManualAddress] = useState("");
  const [directions, setDirections] = useState("");

  const user = getAuth().currentUser;
  const sessionTokenRef = useRef(generateUUID());

  useEffect(() => {
    if (!query.trim() || !user) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    let cancelled = false;

    const debounceTimeout = setTimeout(async () => {
      if (cancelled) return;

      try {
        const results = await searchPlaces(
          query,
          sessionTokenRef.current,
          user
        );
        if (!cancelled) {
          setSuggestions(results);
        }
      } catch {
        if (!cancelled) {
          showErrorToast("Error Loading Locations");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(debounceTimeout);
    };
    // user is excluded on purpose: getAuth().currentUser returns a new
    // object reference on every render even for the same signed-in user,
    // which would re-trigger this effect (and re-search) continuously.
    // user?.uid is the stable, reference-safe way to key off "did the
    // signed-in user actually change".
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, user?.uid]);

  function handleQueryChange(text: string) {
    setQuery(text);

    if (text.trim()) {
      setManualAddress("");
    }
  }

  function handleSearchFocus() {
    setShowResults(true);
  }

  function handleCloseResults() {
    setShowResults(false);
    Keyboard.dismiss();
  }

  function handleAddressFieldChange(key: AddressFieldKey, text: string) {
    setAddressValues((current) => ({
      ...current,
      [key]: text
    }));
  }

  function handleClearAddress() {
    setAddressFields([]);
    setAddressValues({});
    setCountryName("");
    setQuery("");
    setSuggestions([]);
    setShowResults(false);
    setManualAddress("");
  }

  async function handleSelect(suggestion: PlaceSuggestion) {
    if (!user || !suggestion.placeId) {
      return;
    }

    try {
      const details = await getPlaceDetails(
        suggestion.placeId,
        sessionTokenRef.current,
        user
      );
      const raw = extractRawPlaceAddress(
        details.addressComponents,
        details.formattedAddress
      );
      const country = raw.countryCode
        ? getCountryByCode(raw.countryCode)
        : undefined;

      const fields = country
        ? await getAddressFieldsForCountry(country.code)
        : [];
      const values = {
        ...createEmptyAddressValues(fields),
        ...mapRawPlaceAddressToFields(raw, fields)
      };

      setAddressFields(fields);
      setAddressValues(values);
      setCountryName(country?.name ?? raw.countryCode ?? "");

      setQuery("");
      setSuggestions([]);
      setShowResults(false);
      Keyboard.dismiss();

      sessionTokenRef.current = generateUUID();
    } catch {
      showErrorToast("Error Loading Location Details");
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text type="body" color={colors.white}>
          Location Search
        </Text>

        {loading && <ActivityIndicator size={16} color={colors.white} />}
      </View>

      <ContactsSearch
        search={query}
        setSearch={handleQueryChange}
        placeholder="Search for an address or venue..."
        accessoryId="placeSearchInput"
        showSeparator={false}
        inset={false}
        onFocus={handleSearchFocus}
        dark
      />

      {showResults && query.trim() && !loading && (
        <View style={styles.resultsContainer}>
          <View style={styles.resultsList}>
            <ScrollView>
              {suggestions.length === 0 ? (
                <View style={styles.emptyState}>
                  <FontAwesome5 name="search" size={24} color={colors.black} />
                  <Text type="subHeader" color={colors.black} center>
                    No results found
                  </Text>
                  <Text type="body" color={colors.gray} center>
                    Please try again with a different search.
                  </Text>
                </View>
              ) : (
                <View style={styles.resultsListContainer}>
                  {suggestions.map((suggestion) => (
                    <TouchableOpacity
                      key={suggestion.placeId}
                      style={styles.resultItem}
                      onPress={() => handleSelect(suggestion)}
                      hitSlop={getHitSlop("small")}
                    >
                      <Text type="body" color={colors.black}>
                        {suggestion.mainText ?? suggestion.text}
                      </Text>
                      {suggestion.secondaryText && (
                        <Text type="body" color={colors.gray}>
                          {suggestion.secondaryText}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>

          <TextButton
            text="Close Results"
            textColor={colors.white}
            textAlign="center"
            type="body"
            onPress={() => handleCloseResults()}
          />
        </View>
      )}

      {addressFields.length > 0 ? (
        <View style={styles.addressFields}>
          {addressFields.map((field) => (
            <Input
              key={field.key}
              placeholder={field.label}
              value={addressValues[field.key] ?? ""}
              onChangeText={(text) => handleAddressFieldChange(field.key, text)}
              dark
              backgroundColor={colors.primaryTint3}
              textColor={colors.white}
            />
          ))}

          <Input
            placeholder="Country"
            value={countryName}
            onChangeText={setCountryName}
            dark
            backgroundColor={colors.primaryTint3}
            textColor={colors.white}
          />

          <TextButton
            text="Clear Address"
            textColor={colors.white}
            textAlign="center"
            type="body"
            onPress={() => handleClearAddress()}
          />
        </View>
      ) : (
        !query.trim() && (
          <Input
            placeholder="Address"
            value={manualAddress}
            onChangeText={setManualAddress}
            dark
            backgroundColor={colors.primaryTint3}
            textColor={colors.white}
            multilineProps={{
              numberOfLines: 10,
              height: 100
            }}
          />
        )
      )}

      {addressFields.length > 0 && <Divider dark />}

      <Input
        placeholder="Directions / Other Information"
        value={directions}
        onChangeText={setDirections}
        dark
        backgroundColor={colors.primaryTint3}
        textColor={colors.white}
        multilineProps={{
          numberOfLines: 10,
          height: 100
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  addressFields: {
    gap: 6
  },
  container: {
    gap: 6
  },
  emptyState: {
    alignItems: "center",
    gap: 4,
    paddingVertical: 24
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4
  },
  resultItem: {
    alignItems: "center",
    backgroundColor: colors.lightGray + "40",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12
  },
  resultsContainer: {
    gap: 8
  },
  resultsList: {
    backgroundColor: colors.white,
    borderRadius: 16,
    gap: 4,
    height: 200,
    paddingVertical: 4
  },
  resultsListContainer: {
    gap: 4,
    marginHorizontal: 4
  }
});
