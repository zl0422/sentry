import React from 'react';
import styled from '@emotion/styled';

import Button from 'app/components/button';
import ExternalLink from 'app/components/links/externalLink';
import Link from 'app/components/links/link';
import {IconClose, IconOpen} from 'app/icons';
import {t} from 'app/locale';
import space from 'app/styles/space';
import {defined} from 'app/utils';
import theme, {Color, Theme} from 'app/utils/theme';

const TAG_HEIGHT = '20px';

type Props = React.HTMLAttributes<HTMLSpanElement> & {
  /**
   * Dictates color scheme of the tag.
   */
  type?: keyof Theme['tag'];
  /**
   * Icon on the left side.
   */
  icon?: React.ReactNode;
  /**
   * Makes the tag clickable. Use for internal links handled by react router.
   * If no icon is passed, it defaults to IconOpen (can be removed by passing icon={null})
   */
  to?: React.ComponentProps<typeof Link>['to'];
  /**
   * Makes the tag clickable. Use for external links.
   * If no icon is passed, it defaults to IconOpen (can be removed by passing icon={null})
   */
  href?: string;
  /**
   * Shows clickable IconClose on the right side.
   */
  onDismiss?: () => void;
};

function Tag({type = 'default', icon, to, href, onDismiss, children, ...props}: Props) {
  const iconsProps = {
    size: '12px',
    color: theme.tag[type].iconColor as Color,
  };

  const tag = (
    <Background type={type}>
      {tagIcon()}
      <Text>{children}</Text>
      {defined(onDismiss) && (
        <DismissButton
          onClick={handleDismiss}
          size="zero"
          priority="link"
          label={t('Dismiss')}
        >
          <IconClose isCircled {...iconsProps} />
        </DismissButton>
      )}
    </Background>
  );

  function handleDismiss(event: React.MouseEvent) {
    event.preventDefault();
    onDismiss?.();
  }

  function tagIcon() {
    if (React.isValidElement(icon)) {
      return <IconWrapper>{React.cloneElement(icon, {...iconsProps})}</IconWrapper>;
    }

    if ((defined(href) || defined(to)) && icon === undefined) {
      return (
        <IconWrapper>
          <IconOpen {...iconsProps} />
        </IconWrapper>
      );
    }

    return null;
  }

  function tagWithParent() {
    if (defined(href)) {
      return <ExternalLink href={href}>{tag}</ExternalLink>;
    }

    if (defined(to)) {
      return <Link to={to}>{tag}</Link>;
    }

    return tag;
  }

  return <span {...props}>{tagWithParent()}</span>;
}

const Background = styled('div')<{type: keyof Theme['tag']}>`
  display: inline-flex;
  align-items: center;
  height: ${TAG_HEIGHT};
  border-radius: ${TAG_HEIGHT};
  background-color: ${p => p.theme.tag[p.type].background};
  color: ${p => p.theme.tag[p.type].textColor};
  padding: 0 ${space(0.75)};
`;

const IconWrapper = styled('span')`
  margin-right: 3px;
`;

const Text = styled('span')`
  font-size: 12px;
  max-width: 150px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  line-height: ${TAG_HEIGHT};
`;

const DismissButton = styled(Button)`
  margin-left: 3px;
  border: none;
`;

export default Tag;
