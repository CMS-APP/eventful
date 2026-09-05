import { getAuth } from "@react-native-firebase/auth";
import { ActivityIndicator } from "react-native-paper";

import { useEffect, useRef, useState } from "react";

import { Keyboard, StyleSheet, View } from "react-native";

import { Input } from "@/design-system/components/inputs/Input";
import { Divider } from "@/design-system/components/layout/Divider";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { ContactsSearch } from "@/features/contacts/components/ContactsSearch";
import { getCountryByCode } from "@/features/events/countries";
import {
  AddressField,
  AddressFieldKey,
  AddressValues,
  createEmptyAddressValues,
  formatAddress,
  getAddressFieldsForCountry
} from "@/services/address/addressFormat";
import { normalizeEventAddress } from "@/services/address/eventAddress";
import {
  extractRawPlaceAddress,
  mapRawPlaceAddressToFields
} from "@/services/address/placeAddressMapping";
import {
  PlaceSuggestion,
  getPlaceDetails,
  searchPlaces
} from "@/services/firebase/backend";
import { Event } from "@/types/Event";
import { EventAddress } from "@/types/EventAddress";
import { log } from "@/utils/logging";
import { showErrorToast } from "@/utils/toast";
import { generateUUID } from "@/utils/uuid";

import { AddressFieldsForm } from "./AddressFieldsForm";
import { PlaceSuggestionsList } from "./PlaceSuggestionsList";

const SEARCH_DEBOUNCE_MS = 500;
const FIELD_SAVE_DEBOUNCE_MS = 400;

interface LocationSearchProps {
  event: Event;
  setEvent: (event: Event) => void;
}

export function LocationSearch({ event, setEvent }: LocationSearchProps) {
  const initialAddress = useRef(normalizeEventAddress(event.address)).current;

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [addressFields, setAddressFields] = useState<AddressField[]>([]);
  const [addressValues, setAddressValues] = useState<AddressValues>(
    initialAddress.type === "search" ? initialAddress.values : {}
  );
  const [countryCode, setCountryCode] = useState(
    initialAddress.type === "search" ? initialAddress.countryCode : ""
  );
  const [countryName, setCountryName] = useState(
    initialAddress.type === "search" ? initialAddress.countryName : ""
  );
  const [manualAddress, setManualAddress] = useState(
    initialAddress.type === "manual" ? initialAddress.value : ""
  );
  const [directions, setDirections] = useState(event.directions ?? "");

  const user = getAuth().currentUser;
  const sessionTokenRef = useRef(generateUUID());
  const eventRef = useRef(event);
  eventRef.current = event;
  const fieldSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  useEffect(() => {
    return () => {
      if (fieldSaveTimeoutRef.current) {
        clearTimeout(fieldSaveTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (initialAddress.type !== "search") return;

    let cancelled = false;

    getAddressFieldsForCountry(initialAddress.countryCode).then((fields) => {
      if (!cancelled) {
        setAddressFields(fields);
      }
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      } catch (error) {
        if (!cancelled) {
          log("Error Loading Locations " + error, "error");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, user?.uid]);

  function safeFormatAddress(
    nextCountryCode: string,
    nextCountryName: string,
    nextValues: AddressValues
  ): string {
    try {
      return formatAddress(nextCountryCode, nextCountryName, nextValues);
    } catch {
      return [...Object.values(nextValues), nextCountryName]
        .filter(Boolean)
        .join(", ");
    }
  }

  function buildSearchAddress(
    nextCountryCode: string,
    nextCountryName: string,
    nextValues: AddressValues
  ): EventAddress {
    return {
      type: "search",
      countryCode: nextCountryCode,
      countryName: nextCountryName,
      values: nextValues,
      formattedAddress: safeFormatAddress(
        nextCountryCode,
        nextCountryName,
        nextValues
      )
    };
  }

  function commitEventUpdate(partial: Partial<Event>) {
    if (fieldSaveTimeoutRef.current) {
      clearTimeout(fieldSaveTimeoutRef.current);
      fieldSaveTimeoutRef.current = null;
    }
    setEvent({ ...eventRef.current, ...partial });
  }

  function scheduleEventUpdate(partial: Partial<Event>) {
    if (fieldSaveTimeoutRef.current) {
      clearTimeout(fieldSaveTimeoutRef.current);
    }
    fieldSaveTimeoutRef.current = setTimeout(() => {
      setEvent({ ...eventRef.current, ...partial });
    }, FIELD_SAVE_DEBOUNCE_MS);
  }

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
    const nextValues = { ...addressValues, [key]: text };
    setAddressValues(nextValues);
    scheduleEventUpdate({
      address: buildSearchAddress(countryCode, countryName, nextValues)
    });
  }

  function handleCountryNameChange(text: string) {
    setCountryName(text);
    scheduleEventUpdate({
      address: buildSearchAddress(countryCode, text, addressValues)
    });
  }

  function handleManualAddressChange(text: string) {
    setManualAddress(text);
    scheduleEventUpdate({ address: { type: "manual", value: text } });
  }

  function handleDirectionsChange(text: string) {
    setDirections(text);
    scheduleEventUpdate({ directions: text });
  }

  function handleClearAddress() {
    setAddressFields([]);
    setAddressValues({});
    setCountryCode("");
    setCountryName("");
    setQuery("");
    setSuggestions([]);
    setShowResults(false);
    setManualAddress("");
    commitEventUpdate({ address: { type: "manual", value: "" } });
  }

  async function handleSelect(suggestion: PlaceSuggestion) {
    if (!user || !suggestion.placeId) {
      return;
    }

    setLoading(true);

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
      const nextCountryCode = country?.code ?? raw.countryCode ?? "";
      const nextCountryName = country?.name ?? raw.countryCode ?? "";

      setAddressFields(fields);
      setAddressValues(values);
      setCountryCode(nextCountryCode);
      setCountryName(nextCountryName);
      commitEventUpdate({
        address: buildSearchAddress(nextCountryCode, nextCountryName, values)
      });

      setQuery("");
      setSuggestions([]);
      setShowResults(false);
      Keyboard.dismiss();

      sessionTokenRef.current = generateUUID();
    } catch (error) {
      log(`Error Loading Location Details: ${error}`, "error");
      showErrorToast("Error Loading Location Details");
    } finally {
      setLoading(false);
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
        <PlaceSuggestionsList
          suggestions={suggestions}
          onSelect={handleSelect}
          onClose={handleCloseResults}
        />
      )}

      {addressFields.length > 0 ? (
        <AddressFieldsForm
          fields={addressFields}
          values={addressValues}
          countryName={countryName}
          onFieldChange={handleAddressFieldChange}
          onCountryNameChange={handleCountryNameChange}
          onClear={handleClearAddress}
        />
      ) : (
        !query.trim() && (
          <Input
            placeholder="Address"
            value={manualAddress}
            onChangeText={handleManualAddressChange}
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
        onChangeText={handleDirectionsChange}
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
  container: {
    gap: 6
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4
  }
});
