import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

/**
 * Helper function to load translations on the server side
 * 
 * @param locale Current locale
 * @param namespaces Array of translation namespaces to load
 * @returns Props with translations loaded
 */
export const getServerSideTranslations = async (
  locale: string = 'en',
  namespaces: string[] = ['common']
) => {
  return {
    ...(await serverSideTranslations(locale, namespaces)),
  };
};

export default getServerSideTranslations;
