import React from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import type { PublishStep } from '@/application/publish-moment';
import { useLang } from '@/application/use-lang';
import { radius, space } from '@/constants/theme';
import { CAPTION_MAX } from '@/domain/moment';
import { CAMPUS_PLACES, type CampusPlace } from '@/domain/place';

import { PLACE_VISUALS } from '../place-visuals';
import { Button, ChoiceChip, Txt, useTypeStyle } from '../ui';

type ReviewPanelProps = {
  caption: string;
  onCaption: (text: string) => void;
  place: CampusPlace | null;
  onPlace: (place: CampusPlace | null) => void;
  step: PublishStep | null;
  onRetake: () => void;
  onPublish: () => void;
};

/** Controles después de tomar las fotos: lugar, comentario y publicar. */
export const ReviewPanel = ({ caption, onCaption, place, onPlace, step, onRetake, onPublish }: ReviewPanelProps) => {
  const { t } = useLang();
  const typeStyle = useTypeStyle('body');
  const publishing = step !== null;

  return (
    <View style={{ gap: space.md }}>
      <Txt variant="footnote" color="rgba(255,255,255,0.6)">
        {t.capture.where}
      </Txt>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.places}>
        {CAMPUS_PLACES.map((option) => {
          const { Icon } = PLACE_VISUALS[option];
          const selected = place === option;
          return (
            <ChoiceChip
              key={option}
              onDark
              label={t.places[option]}
              selected={selected}
              icon={<Icon size={15} color={selected ? '#FFFFFF' : 'rgba(255,255,255,0.8)'} />}
              onPress={() => onPlace(selected ? null : option)}
            />
          );
        })}
      </ScrollView>
      <View style={styles.captionBox}>
        <TextInput
          value={caption}
          onChangeText={(text) => onCaption(text.slice(0, CAPTION_MAX))}
          placeholder={t.capture.captionPlaceholder}
          placeholderTextColor="rgba(255,255,255,0.45)"
          selectionColor="#FFFFFF"
          maxLength={CAPTION_MAX}
          editable={!publishing}
          accessibilityLabel={t.capture.captionPlaceholder}
          style={[typeStyle, styles.caption]}
        />
        {caption.length > CAPTION_MAX * 0.7 ? (
          <Txt variant="caption" color="rgba(255,255,255,0.55)">
            {String(CAPTION_MAX - caption.length)}
          </Txt>
        ) : null}
      </View>
      <View style={styles.actions}>
        <Button title={t.capture.retake} variant="secondary" onPress={onRetake} disabled={publishing} style={{ flex: 1 }} />
        <Button
          title={t.capture.publish}
          variant="flash"
          onPress={onPublish}
          loading={publishing}
          loadingLabel={step ? t.capture.steps[step] : undefined}
          style={{ flex: 1.4 }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  places: { gap: space.sm, paddingHorizontal: 2 },
  captionBox: {
    flexDirection: 'row', alignItems: 'center', gap: space.sm, backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.md, borderCurve: 'continuous', paddingHorizontal: space.lg,
  },
  caption: { flex: 1, color: '#FFFFFF', height: 52 },
  actions: { flexDirection: 'row', gap: space.md },
});
