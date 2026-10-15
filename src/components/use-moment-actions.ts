import { router } from 'expo-router';
import { Alert, type AlertButton } from 'react-native';

import { useFeed } from '@/application/feed-store';
import { useSession } from '@/application/session-store';
import { toast } from '@/application/toast-store';
import { useLang } from '@/application/use-lang';
import type { Moment } from '@/domain/moment';

import { useErrorText } from './localize-error';

/** Acciones de un momento (me gusta, borrar, reportar, ver perfil), iguales en Hoy, lugares y perfiles. */
export const useMomentActions = () => {
  const { t } = useLang();
  const errorText = useErrorText();
  const uid = useSession((s) => s.student?.uid ?? '');
  const isAdmin = useSession((s) => s.student?.isAdmin === true);

  const fail = (error: unknown) => toast.error(errorText(error));

  const like = (moment: Moment) => {
    useFeed.getState().like(moment, uid).catch(fail);
  };

  const remove = (moment: Moment, title: string, body: string) =>
    Alert.alert(title, body, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.today.deleteConfirm,
        style: 'destructive',
        onPress: () =>
          useFeed
            .getState()
            .remove(moment)
            .then(() => toast.success(t.today.deleted))
            .catch(fail),
      },
    ]);

  const report = (moment: Moment) =>
    Alert.alert(t.today.reportTitle, t.today.reportBody, [
      { text: t.common.cancel, style: 'cancel' },
      {
        text: t.common.report,
        style: 'destructive',
        onPress: () =>
          useFeed
            .getState()
            .report(moment, uid)
            .then(() => toast.success(t.today.reported))
            .catch(fail),
      },
    ]);

  const openAuthor = (moment: Moment) => {
    if (moment.authorId === uid) router.navigate('/(tabs)/profile');
    else router.push({ pathname: '/user/[id]', params: { id: moment.authorId } });
  };

  // Android muestra como máximo tres botones por alerta.
  const more = (moment: Moment) => {
    if (moment.authorId === uid) return remove(moment, t.today.deleteTitle, t.today.deleteBody);
    const buttons: AlertButton[] = [
      { text: t.common.cancel, style: 'cancel' },
      { text: t.moment.viewProfile, onPress: () => openAuthor(moment) },
      isAdmin
        ? { text: t.common.delete, style: 'destructive', onPress: () => remove(moment, t.today.adminDeleteTitle, t.today.adminDeleteBody) }
        : { text: t.common.report, style: 'destructive', onPress: () => report(moment) },
    ];
    Alert.alert(moment.authorName, undefined, buttons);
  };

  return { uid, like, more, openAuthor };
};
