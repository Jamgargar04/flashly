import { BookOpen, CalendarDays, Coffee, FlaskConical, Tag, Trophy, UserPlus, UserCheck } from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, Card, Group, LargeHeader, Row, Txt } from '@/components/ui';
import { brand, radius, space, usePalette } from '@/constants/theme';
import { PREFERENCES } from '@/application/preference-keys';
import { useClassmates } from '@/application/use-classmates';
import { usePreference } from '@/application/use-preference';
import { useLang } from '@/application/use-lang';

export default function Discover() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const { t } = useLang();
  const classmates = useClassmates();
  const [friends, setFriends] = usePreference<string[]>(PREFERENCES.friends, []);

  const PLACES = [
    { name: t.discover.place_library, Icon: BookOpen, color: '#5E5CE6' },
    { name: t.discover.place_cafeteria, Icon: Coffee, color: '#FF9F0A' },
    { name: t.discover.place_court, Icon: Trophy, color: '#30B0C7' },
    { name: t.discover.place_labs, Icon: FlaskConical, color: '#34C759' },
  ];

  const EVENTS = [
    { title: t.discover.event_1_title, when: t.discover.event_1_when },
    { title: t.discover.event_2_title, when: t.discover.event_2_when },
    { title: t.discover.event_3_title, when: t.discover.event_3_when },
  ];

  const toggle = (id: string) => {
    setFriends(friends.includes(id) ? friends.filter((x) => x !== id) : [...friends, id]).catch(() => undefined);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.background }} contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 120, gap: space.xxl }}>
      <LargeHeader title={t.discover.header} subtitle={t.discover.subtitle} />

      <View style={{ gap: space.md }}>
        <Txt variant="title2" style={styles.pad}>
          {t.discover.people}
        </Txt>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.xl, gap: space.md }}>
          {classmates.map((p) => {
            const added = friends.includes(p.id);
            return (
              <Card key={p.id} style={styles.person}>
                <Avatar name={p.name} source={p.avatar} size={64} />
                <Txt variant="headline" center numberOfLines={1}>
                  {p.name.split(' ')[0]}
                </Txt>
                <Txt variant="caption" color={c.secondary} center numberOfLines={1}>
                  {p.group}
                </Txt>
                <Pressable
                  onPress={() => toggle(p.id)}
                  accessibilityRole="button"
                  style={[styles.add, { backgroundColor: added ? c.fill : c.tint }]}>
                  {added ? <UserCheck size={16} color={c.tint} /> : <UserPlus size={16} color="#FFFFFF" />}
                  <Txt variant="caption" color={added ? c.tint : '#FFFFFF'}>
                    {added ? t.discover.added : t.discover.add}
                  </Txt>
                </Pressable>
              </Card>
            );
          })}
        </ScrollView>
      </View>

      <View style={[styles.pad, { gap: space.md }]}>
        <Txt variant="title2">{t.discover.places}</Txt>
        <View style={styles.grid}>
          {PLACES.map(({ name, Icon, color }) => (
            <Card key={name} style={styles.place}>
              <View style={[styles.placeIcon, { backgroundColor: color }]}>
                <Icon size={22} color="#FFFFFF" />
              </View>
              <Txt variant="headline">{name}</Txt>
            </Card>
          ))}
        </View>
      </View>

      <View style={styles.pad}>
        <Group title={t.discover.events}>
          {EVENTS.map((e) => (
            <Row key={e.title} icon={<CalendarDays size={18} color="#FFFFFF" />} iconColor={brand.magenta} title={e.title} value={e.when} />
          ))}
        </Group>
      </View>

      <View style={styles.pad}>
        <Group title={t.discover.nearby} footer={t.discover.nearby_footer}>
          <Row icon={<Tag size={18} color="#FFFFFF" />} iconColor={brand.pink} title={t.discover.promo_1} value={t.discover.place_cafeteria} />
          <Row icon={<Tag size={18} color="#FFFFFF" />} iconColor={brand.pink} title={t.discover.promo_2} value="Papelería" />
        </Group>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: space.xl },
  person: { width: 140, alignItems: 'center', gap: 6, paddingVertical: space.lg },
  add: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: space.sm, paddingHorizontal: space.md, height: 30, borderRadius: radius.pill },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  place: { width: '47.8%', gap: 6 },
  placeIcon: { width: 40, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginBottom: space.xs },
});
