import SwiftUI

struct StoryRow: View {
    let story: Story
    let fontSize: CGFloat
    var showDetails: Bool = false

    var body: some View {
        VStack(alignment: .leading, spacing: showDetails ? 6 : 2) {
            Text(story.title)
                .font(.system(size: fontSize, weight: .medium))
                .lineLimit(nil)
                .foregroundStyle(story.url != nil ? .primary : .secondary)

            if showDetails {
                HStack(spacing: 4) {
                    Text("\(story.score) points")

                    Text("·")

                    Text(story.by)

                    Text("·")

                    Text(story.formattedTime)

                    if let comments = story.descendants {
                        Text("·")

                        Label("\(comments)", systemImage: "bubble.right")
                    }

                    Spacer()
                }
                .font(.caption)
                .foregroundStyle(.secondary)
                .lineLimit(1)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.vertical, showDetails ? 4 : 2)
    }
}
