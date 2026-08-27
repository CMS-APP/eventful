import { useEffect, useMemo, useState } from "react";

import {
  Keyboard,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { Input } from "@/design-system/components/Input";
import { Text } from "@/design-system/components/Text";
import { TextButton } from "@/design-system/components/TextButton";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { ContactsSearch } from "@/features/contacts/components/ContactsSearch";
import {
  COUNTRIES,
  Country,
  getCountryByCode,
  getDefaultCountryCode
} from "@/features/events/countries";
import {
  AddressField,
  AddressFieldKey,
  AddressValues,
  createEmptyAddressValues,
  formatAddress,
  getAddressFieldsForCountry
} from "@/services/address/addressFormat";
import { Event } from "@/types/Event";

interface EventLocationEditProps {
  event: Event;
  setEvent: (event: Event) => void;
}

function filterCountries(query: string): Country[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return COUNTRIES;
  }

  return COUNTRIES.filter(
    (country) =>
      country.name.toLowerCase().includes(normalizedQuery) ||
      country.code.toLowerCase().includes(normalizedQuery)
  );
}

export function EventLocationEdit({ event, setEvent }: EventLocationEditProps) {
  const initialCountryCode = getDefaultCountryCode();
  const initialCountry = getCountryByCode(initialCountryCode);

  const [countryCode, setCountryCode] = useState(initialCountryCode);
  const [searchQuery, setSearchQuery] = useState(initialCountry?.name ?? "");
  const [showResults, setShowResults] = useState(false);
  const [addressValues, setAddressValues] = useState<AddressValues>({});
  const [addressFields, setAddressFields] = useState<AddressField[]>([]);

  const filteredCountries = useMemo(
    () => filterCountries(searchQuery),
    [searchQuery]
  );

  const selectedCountry = getCountryByCode(countryCode);

  useEffect(() => {
    if (!countryCode) {
      setAddressFields([]);
      return;
    }

    let cancelled = false;

    getAddressFieldsForCountry(countryCode).then((fields) => {
      if (!cancelled) {
        setAddressFields(fields);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [countryCode]);

  useEffect(() => {
    if (!countryCode) {
      setAddressValues({});
      return;
    }

    setAddressValues(createEmptyAddressValues(addressFields));
  }, [countryCode, addressFields]);

  function updateEventAddress(nextValues: AddressValues) {
    if (!countryCode || !selectedCountry) {
      return;
    }

    setEvent({
      ...event,
      address: formatAddress(countryCode, selectedCountry.name, nextValues)
    });
  }

  function handleAddressFieldChange(key: AddressFieldKey, text: string) {
    const nextValues = {
      ...addressValues,
      [key]: text
    };

    setAddressValues(nextValues);
    updateEventAddress(nextValues);
  }

  function handleCountrySelect(country: Country) {
    setCountryCode(country.code);
    setSearchQuery(country.name);
    setShowResults(false);
  }

  function handleSearchFocus() {
    setShowResults(true);
  }

  function handleSearchChange(text: string) {
    setSearchQuery(text);
    setShowResults(true);

    const exactMatch = COUNTRIES.find(
      (country) => country.name.toLowerCase() === text.trim().toLowerCase()
    );
    if (exactMatch) {
      setCountryCode(exactMatch.code);
    }
  }

  function handleCloseResults() {
    setShowResults(false);
    Keyboard.dismiss();

    // If the search query does not match any country, clear the search query
    if (
      searchQuery !== "" &&
      !filteredCountries.some(
        (country) => country.name.toLowerCase() === searchQuery.toLowerCase()
      )
    ) {
      setSearchQuery("");
    }
  }

  useEffect(() => {
    if (searchQuery === "") {
      setCountryCode("");
    }
  }, [searchQuery]);

  return (
    <View style={styles.container}>
      <Text type="body" color={colors.white}>
        Country
      </Text>

      <ContactsSearch
        search={searchQuery}
        setSearch={handleSearchChange}
        placeholder="Search for a country..."
        accessoryId="countrySearchInput"
        showSeparator={false}
        inset={false}
        onFocus={handleSearchFocus}
        dark
      />

      {showResults && (
        <View style={styles.resultsContainer}>
          <View style={styles.resultsList}>
            <ScrollView>
              {filteredCountries.length === 0 ? (
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
                  {filteredCountries.map((item) => (
                    <TouchableOpacity
                      key={item.code}
                      style={[
                        styles.resultItem,
                        item.code === countryCode && styles.resultItemSelected
                      ]}
                      onPress={() => handleCountrySelect(item)}
                      hitSlop={getHitSlop("small")}
                    >
                      <Text type="body" color={colors.black}>
                        {item.name}
                      </Text>
                      <Text type="body" color={colors.gray}>
                        {item.code}
                      </Text>
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

      {countryCode !== "" && addressFields.length > 0 && (
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
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  addressFields: {
    gap: 6
  },
  container: {
    flex: 1,
    gap: 6,
    paddingHorizontal: 24
  },
  emptyState: {
    alignItems: "center",
    gap: 4,
    paddingVertical: 24
  },
  resultItem: {
    alignItems: "center",
    backgroundColor: colors.lightGray + "40",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12
  },
  resultItemSelected: {
    backgroundColor: colors.lightGray
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
