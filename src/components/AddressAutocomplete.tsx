
'use client';

import React, {useRef, useEffect, useState} from 'react';
import {APIProvider, useMapsLibrary} from '@vis.gl/react-google-maps';
import {Input} from './ui/input';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { DeliveryZone } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface AddressAutocompleteProps {
  onAddressSelect: (address: string, neighborhood: string | null, cost: number, zoneId: string | null) => void;
  disabled?: boolean;
}

const defaultDeliveryZones: DeliveryZone[] = [
  { id: 'retiro', neighborhoods: ['Retiro en local'], cost: 0.00 },
];

const AddressAutocomplete = ({onAddressSelect, disabled}: AddressAutocompleteProps) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return null;
  }

  return (
    <APIProvider apiKey={apiKey}>
      <AutocompleteComponent onAddressSelect={onAddressSelect} disabled={disabled} />
    </APIProvider>
  );
};

function AutocompleteComponent({onAddressSelect, disabled}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState('');
  const places = useMapsLibrary('places');
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchZones = async () => {
        try {
            const zonesCol = collection(db, 'deliveryZones');
            const q = query(zonesCol, orderBy('cost'));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                setDeliveryZones(defaultDeliveryZones);
            } else {
                const zoneList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DeliveryZone));
                setDeliveryZones(zoneList);
            }
        } catch (error) {
            console.error("Error fetching delivery zones, using defaults:", error);
            setDeliveryZones(defaultDeliveryZones);
        }
    };
    fetchZones();
  }, []);

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
          
          if (neighborhood) {
            const zone = deliveryZones.find(z => z.neighborhoods.some(n => neighborhood.includes(n)));
            if (zone) {
                onAddressSelect(formattedAddress, neighborhood, zone.cost, zone.id);
                toast({
                    title: "¡Zona encontrada!",
                    description: `Costo de envío para ${neighborhood}: $${zone.cost.toFixed(2)}`
                });
            } else {
                onAddressSelect(formattedAddress, neighborhood, 0, null);
                 toast({
                    title: "Zona no encontrada",
                    description: "No cubrimos esa zona. Por favor, intenta con otra dirección o elige 'Retiro en local'.",
                    variant: 'destructive'
                });
            }
          } else {
             onAddressSelect(formattedAddress, null, 0, null);
          }
          setInputValue(formattedAddress);
        }
    });

    return () => {
        if (typeof google !== 'undefined') {
          google.maps.event.removeListener(listener);
        }
    }
  }, [autocomplete, onAddressSelect, deliveryZones, toast]);


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
        disabled={disabled}
      />
    </div>
  );
}

export default AddressAutocomplete;
