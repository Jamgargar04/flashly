import { router } from 'expo-router';
import { Users } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { useDirectory } from '@/application/directory-store';
import { useSession } from '@/application/session-store';
import { toast } from '@/application/toast-store';
import { useLang } from '@/application/use-lang';
import { space, usePalette } from '@/constants/theme';
import { matchesQuery, rankClassmates } from '@/domain/classmate';

import { useErrorText } from '../localize-error';
import { PersonCard, PersonRow } from '../person-card';
import { EmptyState, SearchField, SectionHeader, Txt } from '../ui';

const SUGGESTIONS = 20;

/** Personas del campus: sugerencias automáticas (tu grupo primero) y buscador. */
export const PeopleSection = () => {
  const c = usePalette();
  const { t } = useLang();
  const errorText = useErrorText();
  const student = useSession((s) => s.student);
  const people = useDirectory((s) => s.people);
  const following = useDirectory((s) => s.following);
  const [query, setQuery] = useState('');
  if (!student) return null;

  const ranked = rankClassmates(people, { uid: student.uid, group: student.group }, following);
  const results = ranked.filter((person) => matchesQuery(person, query));
  const toggle = (id: string) => useDirectory.getState().toggleFollow(student.uid, id).catch((e) => toast.error(errorText(e)));
  const open = (id: string) => router.push({ pathname: '/user/[id]', params: { id } });

  return (
    <View style={{ gap: space.md }}>
      <View style={styles.pad}>
        <SectionHeader title={t.discover.people} subtitle={t.discover.peopleSubtitle} />
      </View>
      {ranked.length === 0 ? (
        <View style={styles.pad}>
          <EmptyState icon={<Users size={24} color="#FFFFFF" />} title={t.discover.peopleEmpty} />
        </View>
      ) : (
        <>
          <View style={styles.pad}>
            <SearchField value={query} onChange={setQuery} placeholder={t.discover.searchPlaceholder} clearLabel={t.common.close} />
          </View>
          {query ? (
            <Animated.View entering={FadeIn.duration(200)} style={styles.pad}>
              {results.length === 0 ? (
                <Txt variant="subhead" color={c.secondary} center style={{ paddingVertical: space.lg }}>
                  {t.discover.noResults(query)}
                </Txt>
              ) : (
                results.map((person) => (
                  <PersonRow key={person.id} person={person} following={following.includes(person.id)} onToggleFollow={() => toggle(person.id)} onPress={() => open(person.id)} />
                ))
              )}
            </Animated.View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
              {ranked.slice(0, SUGGESTIONS).map((person) => (
                <PersonCard key={person.id} person={person} following={following.includes(person.id)} onToggleFollow={() => toggle(person.id)} onPress={() => open(person.id)} />
              ))}
            </ScrollView>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  pad: { paddingHorizontal: space.xl },
  carousel: { paddingHorizontal: space.xl, gap: space.md, paddingBottom: space.sm },
});
