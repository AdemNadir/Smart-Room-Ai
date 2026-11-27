# fmt: off
# Words the rule-based parser looks for. Data only, no logic.
#
# Entries are written the natural way (with accents, hamza, tanween). The parser runs the
# same normalisation on these words and on the user's text before comparing them, so
# "après-demain" and "apres demain" or "أربعاء" and "اربعاء" end up equal.
# Longer phrases must be tried before shorter ones ("day after tomorrow" contains
# "tomorrow", "سبورة ذكية" contains "سبورة").

# Days counted from today: 0 = today, 1 = tomorrow, 2 = day after tomorrow.
RELATIVE_DAYS = {
    "en": {
        0: ("today",),
        1: ("tomorrow",),
        2: ("day after tomorrow",),
    },
    "fr": {
        0: ("aujourd'hui", "aujourd hui"),
        1: ("demain",),
        2: ("après-demain", "après demain", "apres demain"),
    },
    "ar": {
        0: ("اليوم",),
        1: ("غدا", "غدًا", "غداً"),
        2: ("بعد غد",),
    },
}

# Index follows date.weekday(): Monday = 0 ... Sunday = 6.
WEEKDAYS = {
    "en": {
        "monday": 0, "tuesday": 1, "wednesday": 2, "thursday": 3,
        "friday": 4, "saturday": 5, "sunday": 6,
    },
    "fr": {
        "lundi": 0, "mardi": 1, "mercredi": 2, "jeudi": 3,
        "vendredi": 4, "samedi": 5, "dimanche": 6,
    },
    "ar": {
        "الاثنين": 0, "الإثنين": 0, "الثلاثاء": 1, "الأربعاء": 2, "الخميس": 3,
        "الجمعة": 4, "السبت": 5, "الأحد": 6,
    },
}

MONTHS = {
    "en": {
        "january": 1, "february": 2, "march": 3, "april": 4, "may": 5, "june": 6,
        "july": 7, "august": 8, "september": 9, "october": 10, "november": 11,
        "december": 12,
    },
    "fr": {
        "janvier": 1, "février": 2, "mars": 3, "avril": 4, "mai": 5, "juin": 6,
        "juillet": 7, "août": 8, "septembre": 9, "octobre": 10, "novembre": 11,
        "décembre": 12,
    },
    # Two naming sets share this table: the Eastern one (يناير, فبراير, ...) and the
    # Algerian one (جانفي, فيفري, ...). Students and staff here use both.
    "ar": {
        "يناير": 1, "جانفي": 1,
        "فبراير": 2, "فيفري": 2,
        "مارس": 3,
        "أبريل": 4, "أفريل": 4,
        "مايو": 5, "ماي": 5,
        "يونيو": 6, "جوان": 6,
        "يوليو": 7, "جويلية": 7,
        "أغسطس": 8, "أوت": 8,
        "سبتمبر": 9,
        "أكتوبر": 10,
        "نوفمبر": 11,
        "ديسمبر": 12,
    },
}

# Keys are the ids of constants.EQUIPMENT.
EQUIPMENT_WORDS = {
    "en": {
        "projector": ("projector", "video projector", "data show", "datashow"),
        "whiteboard": ("whiteboard",),
        "computers": ("computers", "computer", "pcs", "pc"),
        "air_conditioning": ("air conditioning", "air conditioner", "ac"),
        "sound_system": ("sound system", "microphone"),
        "smartboard": ("smartboard", "smart board", "interactive board"),
        "power_outlets": ("power outlets", "power outlet", "sockets"),
    },
    "fr": {
        "projector": ("projecteur", "videoprojecteur", "vidéoprojecteur", "video projecteur"),
        "whiteboard": ("tableau blanc",),
        "computers": ("ordinateurs", "ordinateur", "pc"),
        "air_conditioning": ("climatisation", "clim"),
        "sound_system": ("sonorisation", "microphone", "micro"),
        "smartboard": ("tableau interactif",),
        "power_outlets": ("prises", "prise"),
    },
    "ar": {
        "projector": ("جهاز عرض", "بروجكتور", "داتا شو"),
        "whiteboard": ("سبورة",),
        "computers": ("حواسيب", "حاسوب", "كمبيوتر"),
        "air_conditioning": ("مكيف", "تكييف"),
        "sound_system": ("مكبر صوت", "ميكروفون"),
        "smartboard": ("سبورة ذكية",),
        "power_outlets": ("مقابس", "مقبس"),
    },
}

# Only specific words. "classroom" is deliberately absent: it is in GENERIC_ROOM_WORDS
# and must never become a hard room-type filter.
ROOM_TYPE_WORDS = {
    "en": {
        "amphitheatre": ("amphitheatre", "amphitheater", "amphi"),
        "lab": ("laboratory", "lab", "labs"),
        "lecture": ("lecture hall",),
    },
    "fr": {
        "amphitheatre": ("amphithéâtre", "amphitheatre", "amphi"),
        "lab": ("laboratoire", "labo"),
        "lecture": ("salle de cours magistral",),
    },
    "ar": {
        "amphitheatre": ("مدرج",),
        "lab": ("مخبر",),
        "lecture": ("قاعة محاضرات",),
    },
}

GENERIC_ROOM_WORDS = {
    "en": ("room", "classroom"),
    "fr": ("salle",),
    "ar": ("قاعة",),
}

# A marker near an equipment word turns it from required into preferred.
PREFERENCE_MARKERS = {
    "en": ("preferably", "if possible", "ideally"),
    "fr": ("de préférence", "si possible", "idéalement"),
    "ar": ("يفضل", "ويفضل", "إن أمكن", "إذا أمكن"),
}

# Feminine ordinals, because "hour" (الساعة) is feminine: "من الثامنة إلى العاشرة".
ARABIC_HOURS = {
    "الأولى": 1, "الثانية": 2, "الثالثة": 3, "الرابعة": 4, "الخامسة": 5,
    "السادسة": 6, "السابعة": 7, "الثامنة": 8, "التاسعة": 9, "العاشرة": 10,
    "الحادية عشرة": 11, "الثانية عشرة": 12,
}
ARABIC_NOON = ("منتصف النهار", "الظهر")

STUDENT_WORDS = {
    "en": ("students", "student"),
    "fr": ("étudiants", "étudiant", "etudiants"),
    "ar": ("طلاب", "طالب", "طالبا", "طالباً"),
}
GROUP_OF = {
    "en": ("group of",),
    "fr": ("groupe de",),
    "ar": ("مجموعة من",),
}

# Words that introduce a time range or a count. Arabic "ل" is a prefix glued to the next
# word ("لـ 30 طالب"), so the parser must accept it without a space.
CONNECTORS = {
    "en": {"from": ("from",), "to": ("to", "until"), "for": ("for",)},
    "fr": {"from": ("de",), "to": ("à", "jusqu'à"), "for": ("pour",)},
    "ar": {"from": ("من",), "to": ("إلى", "حتى"), "for": ("ل",)},
}
# fmt: on
