// Groups of similar words for the "Which Word Fits?" question.
// Each word has one sentence where only that word fits. The word appears exactly once.
export interface ConfusableGroup {
  id: string
  sentences: Record<string, string>
}

export const CONFUSABLES: ConfusableGroup[] = [
  {
    id: 'career/carrier',
    sentences: {
      career: 'She hopes to build a successful career in international journalism.',
      carrier: 'The airline is the main carrier of passengers between the two islands.',
    },
  },
  {
    id: 'reply/replay',
    sentences: {
      reply: 'Please reply to this message as soon as you have checked the dates.',
      replay: 'The coach asked the players to watch the replay of the final goal.',
    },
  },
  {
    id: 'patience/patient',
    sentences: {
      patience: 'Teaching young children to read requires a great deal of patience.',
      patient: 'The doctor asked the patient to describe the pain in detail.',
    },
  },
  {
    id: 'bore/bored',
    sentences: {
      bore: 'Repeating the same exercise every day will bore even the keenest students.',
      bored: 'The students grew bored when the lecturer read directly from the slides.',
    },
  },
  {
    id: 'portrait/portraits',
    sentences: {
      portrait: 'She hung a single portrait of her grandmother above the fireplace.',
      portraits: 'The museum has several portraits of kings and queens in its main hall.',
    },
  },
  {
    id: 'benefit/benefits',
    sentences: {
      benefit: 'The new library will be a great benefit to local students.',
      benefits: 'Studies have shown that there are many benefits to learning a second language.',
    },
  },
  {
    id: 'statistic/statistics',
    sentences: {
      statistic: 'The most shocking statistic in the report is that half the children cannot swim.',
      statistics: 'According to government statistics, the number of tourists increased last year.',
    },
  },
  {
    id: 'negative/negatively',
    sentences: {
      negative: 'The test result was negative, so he was allowed to return to work.',
      negatively: 'Noise from the road can negatively affect the sleep of nearby residents.',
    },
  },
  {
    id: 'relevant/irrelevant',
    sentences: {
      relevant: 'Candidates should only mention experience that is directly relevant to the job.',
      irrelevant: 'He skipped the long list of dates because they were irrelevant to his argument.',
    },
  },
  {
    id: 'compatible/incompatible',
    sentences: {
      compatible: 'The two medicines are compatible, so patients can safely take them together.',
      incompatible: 'The two medicines are incompatible, so patients must never take them together.',
    },
  },
  {
    id: 'steady/steadily',
    sentences: {
      steady: 'She kept a steady pace throughout the whole race.',
      steadily: 'The temperature rose steadily throughout the morning.',
    },
  },
  {
    id: 'profession/professional/professionally',
    sentences: {
      profession: 'Medicine is a demanding profession that requires many years of study.',
      professional: 'He gave a professional presentation that impressed the whole committee.',
      professionally: 'The photographs were professionally printed and framed before the exhibition.',
    },
  },
  {
    id: 'corporate/corporation',
    sentences: {
      corporate: 'Her style of management is very corporate and formal.',
      corporation: 'The government sold the railway to a private corporation last year.',
    },
  },
  {
    id: 'consume/consumption',
    sentences: {
      consume: 'Athletes need to consume enough protein to repair their muscles.',
      consumption: 'Daily consumption of fresh fruit is linked to a lower risk of illness.',
    },
  },
  {
    id: 'interest/interested/interesting',
    sentences: {
      interest: 'The students showed great interest in the topic of renewable energy.',
      interested: 'She was interested in the course because it included a field trip.',
      interesting: 'The documentary was so interesting that nobody left the room.',
    },
  },
  {
    id: 'incorporate/incorporating',
    sentences: {
      incorporate: 'The course will incorporate recent research into every weekly lesson.',
      incorporating: 'The team improved the design by incorporating feedback from users.',
    },
  },
  {
    id: 'restricted/restrictive',
    sentences: {
      restricted: 'Access to the archive was restricted by the new security rules.',
      restrictive: 'Many teachers find the national curriculum restrictive because it leaves little room for creativity.',
    },
  },
  {
    id: 'original/originate',
    sentences: {
      original: 'The original painting is kept in a vault under strict security.',
      originate: 'Many of these customs originate from ancient farming communities.',
    },
  },
  {
    id: 'farmer/farms',
    sentences: {
      farmer: 'Each farmer in the village received a small grant for new seeds.',
      farms: 'Most of the farms in this valley grow rice and wheat.',
    },
  },
]
