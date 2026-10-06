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
      career: 'She has built a successful career in nursing and has worked in the same hospital for thirty years.',
      carrier: 'The airline is the largest carrier of cargo between Australia and Asia.',
    },
  },
  {
    id: 'reply/replay',
    sentences: {
      reply: 'She promised to reply to every message before the end of the week.',
      replay: 'The television channel will replay the final match tonight at eight o\'clock.',
    },
  },
  {
    id: 'patience/patient',
    sentences: {
      patience: 'Teaching young children to read requires a great deal of patience.',
      patient: 'The doctor asked the patient to describe where the pain started.',
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
      statistic: 'One shocking statistic in the report is that half of the children cannot swim.',
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
      relevant: 'The tutor asked her to add a relevant example to support the main argument.',
      irrelevant: 'The tutor asked her to remove an irrelevant example that did not support the main argument.',
    },
  },
  {
    id: 'compatible/incompatible',
    sentences: {
      compatible: 'The technician chose a compatible cable that fits both the old and the new computer.',
      incompatible: 'The technician returned an incompatible cable that fits neither the old nor the new computer.',
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
      profession: 'Doctors have a long tradition of caring for others within the profession of medicine.',
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
      interesting: 'It is interesting to see how quickly young children learn new words.',
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
      restrictive: 'Many teachers describe the national curriculum as restrictive because it leaves little room for creativity.',
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
