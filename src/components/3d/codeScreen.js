import * as THREE from 'three'

/**
 * Draws a small code editor (tabs, line numbers, syntax colours, blinking
 * caret) onto a canvas and exposes it as a texture for the laptop screen.
 * The snippets are "typed" out over time and cycle: API → test → React.
 */

const SNIPPETS = [
  {
    file: 'contact_api.py',
    lang: 'py',
    code: `from fastapi import FastAPI
from pydantic import BaseModel, EmailStr

app = FastAPI()

class Contact(BaseModel):
    name: str
    email: EmailStr
    message: str

@app.post("/api/contact")
def create_contact(data: Contact):
    record = save_contact(data)
    return {"status": "saved"}`,
  },
  {
    file: 'test_contact.py',
    lang: 'py',
    code: `import pytest

def test_rejects_invalid_email(client):
    res = client.post("/api/contact", json={
        "name": "Visitor",
        "email": "not-an-email",
        "message": "Hello!",
    })
    assert res.status_code == 422

def test_saves_contact(client, payload):
    res = client.post("/api/contact", json=payload)
    assert res.status_code == 200`,
  },
  {
    file: 'Dashboard.jsx',
    lang: 'js',
    code: `import { useEffect, useState } from 'react'

export default function Dashboard() {
  const [kpis, setKpis] = useState([])

  useEffect(() => {
    fetch('/api/kpis')
      .then((res) => res.json())
      .then(setKpis)
  }, [])

  return <KpiGrid items={kpis} />
}`,
  },
]

const THEME = {
  bg: '#0f1729',
  gutter: '#0c1322',
  tabBar: '#0b1220',
  tabActive: '#0f1729',
  text: '#d6deeb',
  dim: '#4b5a75',
  keyword: '#8aa9ff',
  string: '#9ad7a8',
  number: '#f2b880',
  comment: '#5f6f8c',
  func: '#f6d483',
  deco: '#e59ad4',
  caret: '#ffffff',
}

const KW = {
  py: /\b(from|import|class|def|return|assert|as|with|if|else|for|in|True|False|None)\b/y,
  js: /\b(import|from|export|default|function|const|let|return|useEffect|useState)\b/y,
}

function tokenize(line, lang) {
  const out = []
  let i = 0
  const kw = KW[lang]
  while (i < line.length) {
    const rest = line.slice(i)
    let m
    if ((m = /^(#.*|\/\/.*)/.exec(rest))) out.push([m[0], THEME.comment])
    else if ((m = /^@[\w.]+/.exec(rest))) out.push([m[0], THEME.deco])
    else if ((m = /^("[^"]*"?|'[^']*'?)/.exec(rest))) out.push([m[0], THEME.string])
    else if ((m = /^\d+/.exec(rest))) out.push([m[0], THEME.number])
    else if ((kw.lastIndex = 0, (m = kw.exec(rest)))) out.push([m[0], THEME.keyword])
    else if ((m = /^[A-Za-z_]\w*(?=\()/.exec(rest))) out.push([m[0], THEME.func])
    else if ((m = /^[A-Za-z_]\w*/.exec(rest))) out.push([m[0], THEME.text])
    else if ((m = /^\s+/.exec(rest))) out.push([m[0], THEME.text])
    else out.push([rest[0], THEME.text]), (m = [rest[0]])
    i += m[0].length
  }
  return out
}

export function createCodeScreen({ width = 1024, height = 660 } = {}) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4

  let snippet = 0
  let typed = 0
  let hold = 0
  let lastDrawn = -1
  let caretOn = true

  const FONT = 26
  const LH = 36
  const top = 92
  const left = 96

  function draw() {
    const s = SNIPPETS[snippet]
    ctx.fillStyle = THEME.bg
    ctx.fillRect(0, 0, width, height)

    // window chrome + tabs
    ctx.fillStyle = THEME.tabBar
    ctx.fillRect(0, 0, width, 58)
    ;['#f87171', '#fbbf24', '#34d399'].forEach((c, k) => {
      ctx.fillStyle = c
      ctx.beginPath()
      ctx.arc(28 + k * 26, 29, 8, 0, Math.PI * 2)
      ctx.fill()
    })
    let tx = 120
    SNIPPETS.forEach((sn, k) => {
      ctx.font = `500 20px ui-monospace, Menlo, Consolas, monospace`
      const w = ctx.measureText(sn.file).width + 44
      ctx.fillStyle = k === snippet ? THEME.tabActive : THEME.tabBar
      ctx.fillRect(tx, 10, w, 48)
      if (k === snippet) {
        ctx.fillStyle = '#5b82ff'
        ctx.fillRect(tx, 10, w, 3)
      }
      ctx.fillStyle = k === snippet ? THEME.text : THEME.dim
      ctx.fillText(sn.file, tx + 22, 41)
      tx += w + 4
    })

    // gutter
    ctx.fillStyle = THEME.gutter
    ctx.fillRect(0, 58, 72, height - 58)

    const visible = s.code.slice(0, typed)
    const lines = visible.split('\n')
    ctx.font = `${FONT}px ui-monospace, Menlo, Consolas, monospace`
    ctx.textBaseline = 'alphabetic'
    const maxLines = Math.floor((height - top - 40) / LH)
    const offset = Math.max(0, lines.length - maxLines)
    let caretX = left
    let caretY = top
    for (let li = offset; li < lines.length; li++) {
      const y = top + (li - offset) * LH
      ctx.fillStyle = li === lines.length - 1 ? '#c7d2e6' : THEME.dim
      ctx.textAlign = 'right'
      ctx.fillText(String(li + 1), 56, y)
      ctx.textAlign = 'left'
      let x = left
      for (const [tok, col] of tokenize(lines[li], s.lang)) {
        ctx.fillStyle = col
        ctx.fillText(tok, x, y)
        x += ctx.measureText(tok).width
      }
      caretX = x
      caretY = y
    }
    if (caretOn) {
      ctx.fillStyle = THEME.caret
      ctx.fillRect(caretX + 2, caretY - FONT + 4, 3, FONT + 2)
    }

    // status bar
    ctx.fillStyle = '#2f5bea'
    ctx.fillRect(0, height - 34, width, 34)
    ctx.fillStyle = '#ffffff'
    ctx.font = `500 18px ui-monospace, Menlo, Consolas, monospace`
    ctx.fillText(`main  •  ${s.lang === 'py' ? 'Python' : 'JavaScript'}  •  UTF-8`, 20, height - 11)

    texture.needsUpdate = true
  }

  /** Advance typing. `speed` = characters per second (0 pauses typing). */
  function update(dt, speed) {
    const s = SNIPPETS[snippet]
    const prevCaret = caretOn
    caretOn = Math.floor(performance.now() / 530) % 2 === 0
    if (typed < s.code.length) {
      typed = Math.min(s.code.length, typed + dt * speed)
    } else {
      hold += dt
      if (hold > 2.6) {
        hold = 0
        typed = 0
        snippet = (snippet + 1) % SNIPPETS.length
      }
    }
    const n = Math.floor(typed)
    if (n !== lastDrawn || prevCaret !== caretOn) {
      lastDrawn = n
      draw()
    }
  }

  /** Jump to a mostly-typed state (used for the static first frame). */
  function prefill(fraction = 0.72) {
    typed = Math.floor(SNIPPETS[0].code.length * fraction)
    draw()
  }

  draw()
  return { texture, update, prefill, dispose: () => texture.dispose() }
}
