/**
 * Framework Value Object
 * Represents the detected framework/library
 */

export enum FrameworkType {
  REACT = "React",
  VUE = "Vue",
  ANGULAR = "Angular",
  SVELTE = "Svelte",
  SOLIDJS = "SolidJS",
  PREACT = "Preact",
  NEXTJS = "Next.js",
  NUXT = "Nuxt",
  UNKNOWN = "Unknown",
}

export class Framework {
  private constructor(private readonly type: FrameworkType) {}

  static create(type: FrameworkType): Framework {
    return new Framework(type);
  }

  static fromString(name: string): Framework {
    const normalized = name.toLowerCase().trim();

    switch (normalized) {
      case "react":
        return new Framework(FrameworkType.REACT);
      case "vue":
      case "vuejs":
        return new Framework(FrameworkType.VUE);
      case "angular":
        return new Framework(FrameworkType.ANGULAR);
      case "svelte":
        return new Framework(FrameworkType.SVELTE);
      case "solid":
      case "solidjs":
        return new Framework(FrameworkType.SOLIDJS);
      case "preact":
        return new Framework(FrameworkType.PREACT);
      case "next":
      case "nextjs":
      case "next.js":
        return new Framework(FrameworkType.NEXTJS);
      case "nuxt":
      case "nuxtjs":
        return new Framework(FrameworkType.NUXT);
      default:
        return new Framework(FrameworkType.UNKNOWN);
    }
  }

  /**
   * Detect predominant framework from a list
   */
  static detectPredominant(frameworks: Framework[]): Framework {
    if (frameworks.length === 0) {
      return new Framework(FrameworkType.UNKNOWN);
    }

    const counts = new Map<FrameworkType, number>();

    frameworks.forEach((fw) => {
      const type = fw.getType();
      counts.set(type, (counts.get(type) || 0) + 1);
    });

    // Find most common
    let predominant = FrameworkType.UNKNOWN;
    let maxCount = 0;

    counts.forEach((count, type) => {
      if (count > maxCount && type !== FrameworkType.UNKNOWN) {
        maxCount = count;
        predominant = type;
      }
    });

    return new Framework(predominant);
  }

  getType(): FrameworkType {
    return this.type;
  }

  toString(): string {
    return this.type;
  }

  equals(other: Framework): boolean {
    return this.type === other.type;
  }

  isUnknown(): boolean {
    return this.type === FrameworkType.UNKNOWN;
  }
}
