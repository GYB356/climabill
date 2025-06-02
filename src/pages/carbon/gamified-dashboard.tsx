"use client";

import React from 'react';
import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import { PageHeader } from '@/components/ui/page-header';
import GameifiedCarbonDashboard from '@/components/carbon/GameifiedCarbonDashboard';

const GameifiedDashboardPage: NextPage = () => {
  const { t } = useTranslation('common');
  
  return (
    <>
      <Head>
        <title>{t('gamifiedDashboard.pageTitle')} | ClimaBill</title>
        <meta name="description" content={t('gamifiedDashboard.pageDescription')} />
      </Head>
      
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title={t('gamifiedDashboard.pageTitle')}
          description={t('gamifiedDashboard.pageDescription')}
          className="mb-8"
        />
        
        <GameifiedCarbonDashboard />
      </div>
    </>
  );
};

export const getStaticProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
};

export default GameifiedDashboardPage;
