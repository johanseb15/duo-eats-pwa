
'use client';

import React, {useRef, useEffect, useState} from 'react';
import {APIProvider, useAutocomplete, useMapsLibrary} from '@vis.gl/react-google-maps';
import {Input} from './ui/input';

interface AddressAutocompleteProps {
  onAddressSelect: (address: string, neighborhood: string | null) => void;
}

const AddressAutocomplete = ({onAddressSelect}: AddressAutocompleteProps) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="text-destructive">
        La clave de API de Google Maps no está configurada. Por favor, añada
        NEXT_PUBLIC_GOOGLE_MAPS_API_KEY a su .env
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <AutocompleteComponent onAddressSelect={onAddressSelect} />
    </APIProvider>
  );
};

function AutocompleteComponent({onAddressSelect}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState('');
  const places = useMapsLibrary('places');

  const onPlaceChanged = (place: google.maps.places.PlaceResult | null) => {
    if (place) {
      const formattedAddress = place.formatted_address || '';
      const neighborhood =
        place.address_components?.find(c => c.types.includes('locality'))
          ?.long_name || null;
      onAddressSelect(formattedAddress, neighborhood);
      setInputValue(formattedAddress);
    }
    // clear suggestions
    if (autocomplete) {
        autocomplete.set('types', []);
    }
  };

  const autocomplete = useAutocomplete({
    inputField: inputRef && inputRef.current,
    onPlaceChanged,
    options: {
        componentRestrictions: { country: 'ar' },
        fields: ["address_components", "formatted_address"],
        types: ["address"],
    }
  });


  return (
    <div>
      <label htmlFor="address-input" className="text-sm font-medium">
        Dirección de Entrega
      </label>
      <Input
        id="address-input"
        ref={inputRef}
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        placeholder="Escribe tu calle y número..."
      />
    </div>
  );
}

export default AddressAutocomplete;
