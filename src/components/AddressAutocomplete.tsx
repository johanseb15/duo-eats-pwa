
'use client';

import { useState } from 'react';
import { APIProvider, Map, useAutocomplete, Autocomplete } from '@vis.gl/react-google-maps';
import { Input } from './ui/input';

interface AddressAutocompleteProps {
    onAddressSelect: (address: string, neighborhood: string | null) => void;
}

const AddressAutocomplete = ({ onAddressSelect }: AddressAutocompleteProps) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        return (
            <div className="text-destructive">
                La clave de API de Google Maps no está configurada.
                Por favor, añada NEXT_PUBLIC_GOOGLE_MAPS_API_KEY a su .env
            </div>
        )
    }

    return (
        <APIProvider apiKey={apiKey}>
            <AutocompleteComponent onAddressSelect={onAddressSelect} />
        </APIProvider>
    );
};

const AutocompleteComponent = ({ onAddressSelect }: AddressAutocompleteProps) => {
    const [value, setValue] = useState('');

    const onPlaceChanged = (place: google.maps.places.PlaceResult | null) => {
        if (place) {
            const formattedAddress = place.formatted_address || '';
            const neighborhood = place.address_components?.find(c => c.types.includes('locality'))?.long_name || null;
            onAddressSelect(formattedAddress, neighborhood);
            setValue(formattedAddress);
        }
    }

    return (
        <div>
            <label htmlFor="address-input" className='text-sm font-medium'>Dirección de Entrega</label>
             <Autocomplete
                onPlaceChanged={onPlaceChanged}
                options={{
                    componentRestrictions: { country: 'ar' },
                    fields: ["address_components", "formatted_address"],
                    types: ["address"],
                }}
            >
                <Input
                    id="address-input"
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    placeholder="Escribe tu calle y número..."
                />
            </Autocomplete>
        </div>
    )
}

export default AddressAutocomplete;
