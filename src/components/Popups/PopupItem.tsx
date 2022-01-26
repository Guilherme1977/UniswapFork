import React, { useCallback, useContext, useEffect } from 'react'
import { X } from 'react-feather'
import { useSpring } from 'react-spring/web'
import styled, { ThemeContext } from 'styled-components'
import { animated } from 'react-spring'
import { PopupContent } from 'state/application/actions'
import { useRemovePopup } from 'state/application/hooks'
import ListUpdatePopup from './ListUpdatePopup'
import TransactionPopup from './TransactionPopup'
import ErrorPopup from './ErrorPopup'

export const StyledClose = styled(X)`
  position: absolute;
  right: 10px;
  top: 10px;

  :hover {
    cursor: pointer;
  }
`
export const Popup = styled.div<{ error?: boolean }>`
  display: inline-block;
  width: 100%;
  background-color: ${({ theme }) => theme.bg1};
  position: relative;
  border-radius: 10px;
  padding: 20px 35px 20px 20px;
  overflow: hidden;
  border: 1px solid ${({ error, theme }) => (error ? theme.red1 : 'transparent')};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    min-width: 290px;
    &:not(:last-of-type) {
      margin-right: 20px;
    }
  `}
`
const Fader = styled.div`
  position: absolute;
  bottom: 0px;
  left: 0px;
  width: 100%;
  height: 2px;
  background-color: ${({ theme }) => theme.bg3};
`

const AnimatedFader = animated(Fader)

export default function PopupItem({
  removeAfterMs,
  content,
  popKey,
}: {
  removeAfterMs: number | null
  content: PopupContent
  popKey: string
}) {
  const removePopup = useRemovePopup()
  const removeThisPopup = useCallback(() => removePopup(popKey), [popKey, removePopup])
  useEffect(() => {
    if (removeAfterMs === null) return undefined

    const timeout = setTimeout(() => {
      removeThisPopup()
    }, removeAfterMs)

    return () => {
      clearTimeout(timeout)
    }
  }, [removeAfterMs, removeThisPopup])

  const theme = useContext(ThemeContext)

  let popupContent
  if ('txn' in content) {
    const {
      txn: { hash, success, summary },
    } = content

    popupContent = <TransactionPopup hash={hash} success={success} summary={summary} />
  } else if ('listUpdate' in content) {
    const {
      listUpdate: { listUrl, oldList, newList, auto },
    } = content

    popupContent = <ListUpdatePopup popKey={popKey} listUrl={listUrl} oldList={oldList} newList={newList} auto={auto} />
  } else if ('error' in content) {
    const {
      error: { message, code },
    } = content

    popupContent = <ErrorPopup message={message} code={code} />
    console.error(`Error message: ${message}${code ? `; code: ${code}` : ''}`)
  }

  const faderStyle = useSpring({
    from: { width: '100%' },
    to: { width: '0%' },
    config: { duration: removeAfterMs ?? undefined },
  })

  return (
    //@ts-ignore
    <Popup error={Boolean(content?.error)}>
      <StyledClose color={theme.text2} onClick={removeThisPopup} />
      {popupContent}
      {removeAfterMs !== null ? <AnimatedFader style={faderStyle} /> : null}
    </Popup>
  )
}
