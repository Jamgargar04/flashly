import React, { useEffect, useRef } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';

import { useLang } from '@/application/use-lang';
import { font, radius, space, usePalette } from '@/constants/theme';
import { isSameDay, moveToDay, timeSlots, upcomingDays } from '@/domain/event-schedule';

import { clock } from '../time-format';
import { ChoiceChip, PressableScale, Txt } from '../ui';

const DAYS_AHEAD = 21;
const SLOT_WIDTH = 76;
const SLOT_GAP = space.sm;

type SchedulePickerProps = { startsAt: number; now: number; onChange: (startsAt: number) => void };

/** Día y hora con un toque: tira de días como el calendario de iOS y horarios cada 30 minutos. */
export const SchedulePicker = ({ startsAt, now, onChange }: SchedulePickerProps) => {
  const c = usePalette();
  const { t } = useLang();
  const days = upcomingDays(now, DAYS_AHEAD);
  const slots = timeSlots(startsAt, now);
  const selectedIndex = Math.max(0, slots.indexOf(startsAt));
  const slotList = useRef<FlatList<number>>(null);

  // Lleva la lista de horarios al seleccionado cuando cambia el día.
  useEffect(() => {
    if (slots.length === 0) return;
    // Deja visible el horario anterior para que se note que se puede desplazar.
    const offset = Math.max(0, (selectedIndex - 1) * (SLOT_WIDTH + SLOT_GAP));
    const id = setTimeout(() => slotList.current?.scrollToOffset({ offset, animated: true }), 60);
    return () => clearTimeout(id);
  }, [startsAt, selectedIndex, slots.length]);

  return (
    <View style={{ gap: space.md }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {days.map((day, i) => {
          const selected = isSameDay(day, startsAt);
          const date = new Date(day);
          return (
            <PressableScale
              key={day}
              onPress={() => onChange(moveToDay(startsAt, day, now))}
              haptic="selection"
              scaleTo={0.92}
              accessibilityLabel={i === 0 ? t.time.today : i === 1 ? t.time.tomorrow : `${t.time.days[date.getDay()]} ${date.getDate()}`}
              accessibilityState={{ selected }}
              style={[styles.day, { backgroundColor: selected ? c.tint : c.fill }]}>
              <Txt variant="caption" color={selected ? '#FFFFFF' : c.secondary}>
                {i === 0 ? t.time.today : t.time.daysShort[date.getDay()]}
              </Txt>
              <Txt variant="title3" color={selected ? '#FFFFFF' : c.label} style={{ fontFamily: font.bold }}>
                {String(date.getDate())}
              </Txt>
            </PressableScale>
          );
        })}
      </ScrollView>

      {slots.length === 0 ? (
        <Txt variant="footnote" color={c.secondary}>
          {t.admin.noTimes}
        </Txt>
      ) : (
        <FlatList
          ref={slotList}
          horizontal
          data={slots}
          keyExtractor={(slot) => String(slot)}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
          getItemLayout={(_, index) => ({ length: SLOT_WIDTH + SLOT_GAP, offset: (SLOT_WIDTH + SLOT_GAP) * index, index })}
          renderItem={({ item }) => (
            <ChoiceChip
              label={clock(item)}
              selected={item === startsAt}
              onPress={() => onChange(item)}
              style={{ width: SLOT_WIDTH, marginRight: SLOT_GAP, justifyContent: 'center' }}
            />
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { paddingHorizontal: 2 },
  day: {
    width: 56, height: 66, marginRight: space.sm, borderRadius: radius.md, borderCurve: 'continuous',
    alignItems: 'center', justifyContent: 'center', gap: 2,
  },
});
