
'use client';

import React, {useRef, useEffect, useState} from 'react';
import {APIProvider, useMapsLibrary} from '@vis.gl/react-google-maps';
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
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const autocompleteInstance = new places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: 'ar' },
        fields: ["address_components", "formatted_address"],
        types: ["address"],
    });
    setAutocomplete(autocompleteInstance);
  }, [places]);

  useEffect(() => {
    if (!autocomplete) return;

    const listener = autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place) {
          const formattedAddress = place.formatted_address || '';
          const neighborhood =
            place.address_components?.find(c => c.types.includes('locality'))
              ?.long_name || null;
          onAddressSelect(formattedAddress, neighborhood);
          setInputValue(formattedAddress);
        }
    });

    return () => {
        google.maps.event.removeListener(listener);
    }
  }, [autocomplete, onAddressSelect]);


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
