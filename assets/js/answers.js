/* ============================================
   STYLISHANDHEALTHY — QUICK ANSWER SEARCH
   ============================================ */

'use strict';

(function initQuickAnswers() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const entries = Array.isArray(window.SH_QUICK_ANSWERS) ? window.SH_QUICK_ANSWERS : [];
  const form = document.getElementById('answerForm');
  const input = document.getElementById('answerSearch');
  const result = document.getElementById('answerResult');
  const panel = document.getElementById('answerPanel');
  const suggestions = document.getElementById('answerSuggestions');
  const promptButtons = document.querySelectorAll('[data-question]');

  if (!form || !input || !result || !panel || !suggestions) return;

  const stopWords = new Set([
    'a', 'an', 'and', 'are', 'at', 'be', 'can', 'do', 'does', 'for', 'from', 'how',
    'i', 'in', 'is', 'it', 'my', 'of', 'on', 'or', 'should', 'the', 'to', 'what',
    'when', 'which', 'why', 'with', 'you', 'your'
  ]);

  const spellingAliases = new Map([
    ['salycilic', 'salicylic'],
    ['salycilkic', 'salicylic'],
    ['salicilic', 'salicylic'],
    ['saliclyic', 'salicylic'],
    ['benzyol', 'benzoyl'],
    ['moisterizer', 'moisturizer'],
    ['moisturiser', 'moisturizer'],
    ['sun screen', 'sunscreen']
  ]);

  const normalize = value => {
    let normalized = String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9%+]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    spellingAliases.forEach((replacement, misspelling) => {
      normalized = normalized.replace(new RegExp(`\\b${misspelling}\\b`, 'g'), replacement);
    });
    return normalized;
  };

  const tokenize = value => normalize(value)
    .split(' ')
    .filter(token => token && (!stopWords.has(token) || token.length > 5));

  const editDistance = (left, right) => {
    if (left === right) return 0;
    if (!left.length) return right.length;
    if (!right.length) return left.length;

    let previous = Array.from({ length: right.length + 1 }, (_, index) => index);
    for (let row = 1; row <= left.length; row += 1) {
      const current = [row];
      for (let column = 1; column <= right.length; column += 1) {
        const cost = left[row - 1] === right[column - 1] ? 0 : 1;
        current[column] = Math.min(
          current[column - 1] + 1,
          previous[column] + 1,
          previous[column - 1] + cost
        );
      }
      previous = current;
    }
    return previous[right.length];
  };

  const tokenSimilarity = (queryToken, targetToken) => {
    if (queryToken === targetToken) return 1;
    if (queryToken.length >= 4 && targetToken.length >= 4 && (targetToken.startsWith(queryToken) || queryToken.startsWith(targetToken))) return .88;
    if (queryToken.length < 4 || targetToken.length < 4) return 0;
    const distance = editDistance(queryToken, targetToken);
    const similarity = 1 - distance / Math.max(queryToken.length, targetToken.length);
    return similarity >= .7 ? similarity : 0;
  };

  const searchableEntries = entries.map(entry => {
    const questionText = normalize(`${entry.question} ${entry.sourceQuestion || ''}`);
    const corpusText = normalize(`${entry.question} ${entry.sourceQuestion || ''} ${entry.answer} ${entry.topic} ${entry.article} ${entry.url}`);
    return {
      entry,
      questionText,
      questionTokens: tokenize(questionText),
      corpusText,
      corpusTokens: tokenize(corpusText)
    };
  });

  const scoreEntry = (record, rawQuery) => {
    const query = normalize(rawQuery);
    const queryTokens = tokenize(query);
    if (!query || !queryTokens.length) return 0;
    if (record.questionText === query) return 400;

    let score = 0;
    if (record.questionText.includes(query)) score += 120;
    if (query.includes(record.questionText) && record.questionText.length > 8) score += 80;

    let matched = 0;
    queryTokens.forEach(queryToken => {
      const bestQuestionMatch = record.questionTokens.reduce(
        (best, targetToken) => Math.max(best, tokenSimilarity(queryToken, targetToken)),
        0
      );
      const bestCorpusMatch = record.corpusTokens.reduce(
        (best, targetToken) => Math.max(best, tokenSimilarity(queryToken, targetToken)),
        0
      );
      const best = Math.max(bestQuestionMatch, bestCorpusMatch * .72);
      if (best >= .68) matched += 1;
      score += best * (bestQuestionMatch ? 24 : 13);
    });

    const coverage = matched / queryTokens.length;
    score += coverage * 105;
    if (coverage < .5) score *= .48;
    return score;
  };

  const findMatches = query => searchableEntries
    .map(record => ({ entry: record.entry, score: scoreEntry(record, query), record }))
    .filter(item => item.score > 0)
    .sort((left, right) => right.score - left.score || left.entry.question.localeCompare(right.entry.question));

  const isBroadQuery = rawQuery => {
    const normalizedQuery = normalize(rawQuery);
    const words = normalizedQuery.split(' ').filter(Boolean);
    const questionIntent = /^(can|could|do|does|how|is|are|should|what|when|where|which|who|why|will|would)\b/.test(normalizedQuery);
    return !questionIntent && tokenize(normalizedQuery).length <= 2 && words.length <= 3;
  };

  const isCompleteBroadMatch = (record, rawQuery) => tokenize(rawQuery).every(queryToken =>
    record.corpusTokens.includes(queryToken)
  );

  const questionCoverage = (record, rawQuery) => {
    const queryTokens = tokenize(rawQuery);
    if (!queryTokens.length) return 0;
    const matched = queryTokens.filter(queryToken =>
      record.questionTokens.some(targetToken => tokenSimilarity(queryToken, targetToken) >= .68)
    ).length;
    return matched / queryTokens.length;
  };

  const clearElement = element => {
    while (element.firstChild) element.removeChild(element.firstChild);
  };

  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === 'string') node.textContent = text;
    return node;
  };

  const hideSuggestions = () => {
    suggestions.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    clearElement(suggestions);
  };

  const selectQuestion = (question, { focusResult = true } = {}) => {
    input.value = question;
    hideSuggestions();
    showAnswer(question, { focusResult });
  };

  const questionButton = (entry, className) => {
    const button = element('button', className);
    button.type = 'button';
    const question = element('strong', '', entry.question);
    const topic = element('span', '', entry.topic);
    button.append(question, topic);
    button.addEventListener('click', () => selectQuestion(entry.question));
    return button;
  };

  const popularQueries = [
    'Can salicylic acid treat acne?',
    'Why does my sunscreen pill?',
    'Can you tan at UV index 2?',
    'Is beef tallow good for skin?',
    'Do LED face masks work?',
    'Why does my moisturizer burn?'
  ];

  const renderPopular = () => {
    clearElement(result);
    const heading = element('h2', 'answer-state-heading', 'What are you curious about?');
    heading.id = 'answer-state-title';
    const copy = element('p', 'answer-state-copy', 'Ask in your own words, or start with one of these popular questions. Search a broad topic to see every relevant answer, or ask a full question for one precise match among 600 evidence-linked answers.');
    const grid = element('div', 'popular-grid');
    const used = new Set();

    popularQueries.forEach(query => {
      const match = findMatches(query).find(item => !used.has(item.entry.id));
      if (!match) return;
      used.add(match.entry.id);
      grid.appendChild(questionButton(match.entry, 'popular-question'));
    });
    result.append(heading, copy, grid);
  };

  const renderNoMatch = query => {
    clearElement(result);
    const heading = element('h2', 'answer-state-heading', 'We have not covered that one yet.');
    heading.id = 'answer-state-title';
    const copy = element('p', 'answer-state-copy', `We could not find a reliable match for “${query}.” Try a shorter phrase, a product name, or browse the full blog instead.`);
    const link = element('a', 'answer-source-link', 'Browse all guides →');
    link.href = '/blog';
    link.style.marginTop = '24px';
    result.append(heading, copy, link);
  };

  const buildAnswerCard = (entry, { primary = false } = {}) => {
    const card = element('article', primary ? 'answer-card' : 'answer-card answer-result-card');
    const topic = element('span', 'answer-topic', entry.topic);
    const heading = element('h2', 'answer-question', entry.question);
    if (primary) heading.id = 'answer-state-title';
    const copy = element('p', 'answer-copy', entry.answer);

    const source = element('div', 'answer-source');
    const sourceCopy = element('div', 'answer-source-copy');
    sourceCopy.append(
      element('small', '', 'Full answer and context'),
      element('strong', '', entry.article)
    );
    const sourceLink = element('a', 'answer-source-link', 'Read the full guide →');
    sourceLink.href = entry.url;
    source.append(sourceCopy, sourceLink);
    card.append(topic, heading, copy, source);
    return card;
  };

  const focusAnswerPanel = () => {
    panel.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
  };

  const renderAnswer = (best, { focusResult = true } = {}) => {
    clearElement(result);
    result.appendChild(buildAnswerCard(best, { primary: true }));

    result.appendChild(element('p', 'answer-note', 'This is a short educational summary. Open the linked guide for sources, limitations, safety details, and the complete explanation.'));
    if (focusResult) focusAnswerPanel();
  };

  const renderBroadResults = (query, matches, { focusResult = true } = {}) => {
    clearElement(result);
    const heading = element('h2', 'answer-state-heading', `All answers about “${query}”`);
    heading.id = 'answer-state-title';
    const countLabel = `${matches.length} relevant ${matches.length === 1 ? 'answer' : 'answers'} found`;
    const count = element('p', 'answer-state-copy answer-results-count', countLabel);
    const grid = element('div', 'answer-results-grid');
    matches.forEach(({ entry }) => grid.appendChild(buildAnswerCard(entry)));
    result.append(heading, count, grid);
    result.appendChild(element('p', 'answer-note', 'Each short answer is grounded in the linked full guide. Open a guide for sources, limitations, safety details, and complete context.'));
    if (focusResult) focusAnswerPanel();
  };

  function showAnswer(rawQuery, { focusResult = true } = {}) {
    const query = String(rawQuery || '').trim();
    const url = new URL(window.location.href);
    if (query) url.searchParams.set('q', query);
    else url.searchParams.delete('q');
    window.history.replaceState({}, '', url);

    if (!query) {
      renderPopular();
      return;
    }

    const matches = findMatches(query);
    if (!matches.length || matches[0].score < 48) {
      renderNoMatch(query);
      return;
    }

    if (isBroadQuery(query)) {
      const broadMatches = matches.filter(item => item.score >= 48 && isCompleteBroadMatch(item.record, query));
      renderBroadResults(query, broadMatches, { focusResult });
      return;
    }

    const specificMatches = matches
      .map(item => ({ ...item, questionCoverage: questionCoverage(item.record, query) }))
      .filter(item => item.questionCoverage >= .5)
      .sort((left, right) => right.questionCoverage - left.questionCoverage || right.score - left.score);
    const best = specificMatches[0];
    if (!best) {
      renderNoMatch(query);
      return;
    }

    renderAnswer(best.entry, { focusResult });
  }

  const renderSuggestions = query => {
    const normalizedQuery = normalize(query);
    if (normalizedQuery.length < 2) {
      hideSuggestions();
      return;
    }

    const matches = findMatches(query).filter(item => item.score >= 34).slice(0, 5);
    clearElement(suggestions);
    if (!matches.length) {
      hideSuggestions();
      return;
    }

    matches.forEach(({ entry }) => {
      const button = element('button', 'answer-suggestion');
      button.type = 'button';
      button.setAttribute('role', 'option');
      button.append(element('span', '', entry.question), element('span', '', entry.topic));
      button.addEventListener('click', () => selectQuestion(entry.question));
      suggestions.appendChild(button);
    });
    suggestions.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  };

  form.addEventListener('submit', event => {
    event.preventDefault();
    hideSuggestions();
    showAnswer(input.value);
  });

  input.addEventListener('input', () => renderSuggestions(input.value));
  input.addEventListener('keydown', event => {
    if (event.key === 'Escape') hideSuggestions();
    if (event.key === 'ArrowDown' && !suggestions.hidden) {
      event.preventDefault();
      suggestions.querySelector('button')?.focus();
    }
  });

  suggestions.addEventListener('keydown', event => {
    const buttons = Array.from(suggestions.querySelectorAll('button'));
    const currentIndex = buttons.indexOf(document.activeElement);
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      buttons[(currentIndex + 1) % buttons.length]?.focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (currentIndex <= 0) input.focus();
      else buttons[currentIndex - 1]?.focus();
    } else if (event.key === 'Escape') {
      hideSuggestions();
      input.focus();
    }
  });

  promptButtons.forEach(button => {
    button.addEventListener('click', () => selectQuestion(button.dataset.question || button.textContent));
  });

  document.addEventListener('pointerdown', event => {
    if (!event.target.closest('.answers-form-wrap')) hideSuggestions();
  });

  if (entries.length !== 600) {
    clearElement(result);
    result.appendChild(element('p', 'answer-state-copy', 'Quick Answers are being updated. Please browse the full blog for now.'));
    return;
  }

  const initialQuery = new URLSearchParams(window.location.search).get('q');
  if (initialQuery) {
    input.value = initialQuery;
    showAnswer(initialQuery, { focusResult: false });
  } else {
    renderPopular();
  }
})();
