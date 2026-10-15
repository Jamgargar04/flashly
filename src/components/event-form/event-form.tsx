import { Send } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { pickImage } from '@/application/pick-image';
import type { PublishStep } from '@/application/publish-moment';
import { useSession } from '@/application/session-store';
import { toast } from '@/application/toast-store';
import { useLang } from '@/application/use-lang';
import { useNow } from '@/application/use-now';
import { usePublishEvent } from '@/application/use-publishing';
import { space, usePalette } from '@/constants/theme';
import { EVENT_DURATIONS, EVENT_LIMITS } from '@/domain/event';
import { defaultStart } from '@/domain/event-schedule';
import { CAMPUS_PLACES, type CampusPlace } from '@/domain/place';

import { EventCard } from '../event-card';
import { useErrorText } from '../localize-error';
import { PLACE_VISUALS } from '../place-visuals';
import { durationLabel } from '../time-format';
import { Button, Card, ChoiceChip, Field, Txt } from '../ui';
import { CoverPicker } from './cover-picker';
import { SchedulePicker } from './schedule-picker';

const Label = ({ children }: { children: string }) => {
  const c = usePalette();
  return (
    <Txt variant="footnote" color={c.secondary} style={styles.label}>
      {children}
    </Txt>
  );
};

/** Formulario de evento: casi todo se elige con toques; solo se escribe el título. */
export const EventForm = () => {
  const { t } = useLang();
  const errorText = useErrorText();
  const uid = useSession((s) => s.student?.uid ?? '');
  const publishEvent = usePublishEvent();
  const now = useNow(60_000);
  const [cover, setCover] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startsAt, setStartsAt] = useState(() => defaultStart(Date.now()));
  const [duration, setDuration] = useState<number>(120);
  const [place, setPlace] = useState<CampusPlace | 'other' | null>(null);
  const [otherPlace, setOtherPlace] = useState('');
  const [step, setStep] = useState<PublishStep | null>(null);
  const location = place === 'other' ? otherPlace.trim() : (place ?? '');

  // Si el horario elegido ya pasó mientras el formulario estaba abierto, salta al siguiente libre.
  useEffect(() => {
    if (startsAt <= now) setStartsAt(defaultStart(now));
  }, [now, startsAt]);

  const chooseCover = async () => {
    const uri = await pickImage({ aspect: [16, 9] }).catch(() => null);
    if (uri) setCover(uri);
  };

  const reset = () => {
    setCover(null);
    setTitle('');
    setDescription('');
    setPlace(null);
    setOtherPlace('');
    setStartsAt(defaultStart(Date.now()));
  };

  const publish = async () => {
    setStep('save');
    try {
      await publishEvent({ draft: { title, description, location, startsAt, durationMinutes: duration }, coverUri: cover, createdBy: uid }, setStep);
      toast.success(t.admin.published);
      reset();
    } catch (error) {
      toast.error(errorText(error));
    } finally {
      setStep(null);
    }
  };

  return (
    <Card style={styles.card}>
      <Txt variant="title3">{t.admin.newEvent}</Txt>
      <CoverPicker uri={cover} onPick={chooseCover} onRemove={() => setCover(null)} />
      <Field label={t.admin.title} value={title} onChangeText={setTitle} placeholder={t.admin.titlePlaceholder} maxLength={EVENT_LIMITS.title} />
      <Field
        label={`${t.admin.description} · ${t.common.optional}`}
        value={description}
        onChangeText={setDescription}
        placeholder={t.admin.descriptionPlaceholder}
        maxLength={EVENT_LIMITS.description}
        multiline
      />
      <View>
        <Label>{t.admin.when}</Label>
        <SchedulePicker startsAt={startsAt} now={now} onChange={setStartsAt} />
      </View>
      <View>
        <Label>{t.admin.duration}</Label>
        <View style={styles.wrap}>
          {EVENT_DURATIONS.map((minutes) => (
            <ChoiceChip key={minutes} label={durationLabel(t.time, minutes)} selected={duration === minutes} onPress={() => setDuration(minutes)} />
          ))}
        </View>
      </View>
      <View>
        <Label>{`${t.admin.place} · ${t.common.optional}`}</Label>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {CAMPUS_PLACES.map((option) => {
            const { Icon, color } = PLACE_VISUALS[option];
            const selected = place === option;
            return (
              <ChoiceChip
                key={option}
                label={t.places[option]}
                selected={selected}
                icon={<Icon size={15} color={selected ? '#FFFFFF' : color} />}
                onPress={() => setPlace(selected ? null : option)}
              />
            );
          })}
          <ChoiceChip label={t.admin.otherPlace} selected={place === 'other'} onPress={() => setPlace(place === 'other' ? null : 'other')} />
        </ScrollView>
      </View>
      {place === 'other' ? (
        <Field label={t.admin.place} value={otherPlace} onChangeText={setOtherPlace} placeholder={t.admin.otherPlacePlaceholder} maxLength={EVENT_LIMITS.location} autoFocus />
      ) : null}
      <View style={{ gap: space.sm }}>
        <Label>{t.admin.preview}</Label>
        <EventCard event={{ title: title.trim() || t.admin.previewTitle, startsAt, endsAt: startsAt + duration * 60_000, location, imageUrl: cover ?? undefined }} now={now} />
      </View>
      <Button
        title={t.admin.publish}
        icon={<Send size={18} color="#FFFFFF" />}
        onPress={publish}
        loading={step !== null}
        loadingLabel={step ? t.admin.steps[step] : undefined}
        disabled={title.trim().length < 3}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { gap: space.lg },
  label: { marginLeft: 4, marginBottom: space.sm },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  row: { gap: space.sm, paddingHorizontal: 2 },
});
