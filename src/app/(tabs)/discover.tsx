import { BookOpen, CalendarDays, Coffee, FlaskConical, Tag, Trophy, UserPlus, UserCheck } from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, Card, Group, LargeHeader, Row, Txt } from '@/components/ui';
import { brand, radius, space, usePalette } from '@/constants/theme';
import { PREFERENCES } from '@/application/preference-keys';
import { useClassmates } from '@/application/use-classmates';
import { usePreference } from '@/application/use-preference';

const PLACES = [
  { name: 'Biblioteca', count: 12, Icon: BookOpen, color: '#5E5CE6' },
  { name: 'Cafetería', count: 18, Icon: Coffee, color: '#FF9F0A' },
  { name: 'Cancha', count: 7, Icon: Trophy, color: '#30B0C7' },
  { name: 'Laboratorios', count: 9, Icon: FlaskConical, color: '#34C759' },
];

const EVENTS = [
  { title: 'Torneo relámpago de fútbol', when: 'Jueves, 13:00' },
  { title: 'Taller de fotografía con celular', when: 'Viernes, 11:00' },
  { title: 'Noche de cine en el auditorio', when: 'Viernes, 18:30' },
];

export default function Discover() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const classmates = useClassmates();
  const [friends, setFriends] = usePreference<string[]>(PREFERENCES.friends, []);

  const toggle = (id: string) => {
    setFriends(friends.includes(id) ? friends.filter((x) => x !== id) : [...friends, id]).catch(() => undefined);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.background }} contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 120, gap: space.xxl }}>
      <LargeHeader title="Descubrir" subtitle="Tu campus, hoy" />

      <View style={{ gap: space.md }}>
        <Txt variant="title2" style={styles.pad}>
          Personas de tu generación
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
                    {added ? 'Agregado' : 'Agregar'}
                  </Txt>
                </Pressable>
              </Card>
            );
          })}
        </ScrollView>
      </View>

      <View style={[styles.pad, { gap: space.md }]}>
        <Txt variant="title2">Lugares con movimiento</Txt>
        <View style={styles.grid}>
          {PLACES.map(({ name, count, Icon, color }) => (
            <Card key={name} style={styles.place}>
              <View style={[styles.placeIcon, { backgroundColor: color }]}>
                <Icon size={22} color="#FFFFFF" />
              </View>
              <Txt variant="headline">{name}</Txt>
              <Txt variant="footnote" color={c.secondary}>
                {count} momentos hoy
              </Txt>
            </Card>
          ))}
        </View>
      </View>

      <View style={styles.pad}>
        <Group title="Actividades de la semana">
          {EVENTS.map((e) => (
            <Row key={e.title} icon={<CalendarDays size={18} color="#FFFFFF" />} iconColor={brand.magenta} title={e.title} value={e.when} />
          ))}
        </Group>
      </View>

      <View style={styles.pad}>
        <Group title="Cerca del campus" footer="Contenido de ejemplo en esta versión de prueba.">
          <Row icon={<Tag size={18} color="#FFFFFF" />} iconColor={brand.pink} title="2×1 en café durante la ventana" value="Cafetería" />
          <Row icon={<Tag size={18} color="#FFFFFF" />} iconColor={brand.pink} title="10% en copias mostrando tu momento" value="Papelería" />
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
